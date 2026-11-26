import { execFile } from 'node:child_process';
import { cp, mkdir, rm } from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';
import { promisify } from 'node:util';
const execFileAsync = promisify(execFile);
const SKIP_COPY_DIRS = new Set(['node_modules', '.git', '.agents']);
async function runGit(args, cwd, signal) {
    const { stdout } = await execFileAsync('git', args, {
        cwd,
        signal,
        timeout: 60_000,
        maxBuffer: 4 * 1024 * 1024,
        windowsHide: true,
    });
    return stdout.trim();
}
export async function detectGitRoot(dir, signal) {
    try {
        const out = await runGit(['rev-parse', '--show-toplevel'], dir, signal);
        return out.length > 0 ? resolve(out) : undefined;
    }
    catch {
        return undefined;
    }
}
export function sanitizeSegment(raw) {
    const cleaned = raw.toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '');
    return cleaned.length > 0 ? cleaned.slice(0, 32) : 'worker';
}
export function buildSwarmBranchName(swarmId, memberName) {
    const shortId = sanitizeSegment(swarmId).slice(0, 8);
    const safeName = sanitizeSegment(memberName);
    return `ag-swarm/${shortId}/${safeName}`;
}
async function copyWorkspaceFallback(srcDir, destDir) {
    await rm(destDir, { recursive: true, force: true });
    await mkdir(destDir, { recursive: true });
    await cp(srcDir, destDir, {
        recursive: true,
        force: true,
        filter: (sourcePath) => {
            if (resolve(sourcePath) === resolve(srcDir))
                return true;
            return !SKIP_COPY_DIRS.has(basename(sourcePath));
        },
    });
}
export async function prepareWorkspace(input) {
    const baseCwd = resolve(input.baseCwd);
    if (input.mode === 'inherit') {
        return {
            mode: 'inherit',
            workspace: baseCwd,
            owned: false,
            kind: 'inherit',
        };
    }
    const branchName = buildSwarmBranchName(input.swarmId, input.memberName);
    const targetDir = resolve(join(input.storageDir, input.swarmId, 'workspaces', sanitizeSegment(input.memberName)));
    await mkdir(dirname(targetDir), { recursive: true });
    const repoRoot = await detectGitRoot(baseCwd, input.signal);
    if (input.mode === 'share') {
        if (input.enableWorktrees && repoRoot) {
            const hostWorktrees = input.ctx?.get('worktrees');
            if (typeof hostWorktrees?.create === 'function' && input.parentAgent) {
                try {
                    const created = await hostWorktrees.create(input.parentAgent, { name: branchName }, input.signal);
                    if (created && typeof created.path === 'string' && created.path.length > 0) {
                        return {
                            mode: 'share',
                            workspace: resolve(created.path),
                            branch: created.branch ?? branchName,
                            repoRoot: created.repositoryRoot ? resolve(created.repositoryRoot) : repoRoot,
                            owned: true,
                            kind: 'worktree',
                        };
                    }
                }
                catch {
                    // Fall through to direct git worktree creation below.
                }
            }
            await rm(targetDir, { recursive: true, force: true });
            try {
                await runGit(['worktree', 'add', '-b', branchName, targetDir, 'HEAD'], repoRoot, input.signal);
                return {
                    mode: 'share',
                    workspace: targetDir,
                    branch: branchName,
                    repoRoot,
                    owned: true,
                    kind: 'worktree',
                };
            }
            catch {
                const uniqueBranch = `${branchName}-${Date.now().toString(36)}`;
                await runGit(['worktree', 'add', '-b', uniqueBranch, targetDir, 'HEAD'], repoRoot, input.signal);
                return {
                    mode: 'share',
                    workspace: targetDir,
                    branch: uniqueBranch,
                    repoRoot,
                    owned: true,
                    kind: 'worktree',
                };
            }
        }
        await copyWorkspaceFallback(baseCwd, targetDir);
        return {
            mode: 'share',
            workspace: targetDir,
            owned: true,
            kind: 'copy',
        };
    }
    // mode === 'branch'
    if (repoRoot) {
        await rm(targetDir, { recursive: true, force: true });
        await runGit(['clone', '--local', '--no-hardlinks', repoRoot, targetDir], dirname(targetDir), input.signal);
        await runGit(['checkout', '-b', branchName], targetDir, input.signal);
        return {
            mode: 'branch',
            workspace: targetDir,
            branch: branchName,
            repoRoot,
            owned: true,
            kind: 'clone',
        };
    }
    await copyWorkspaceFallback(baseCwd, targetDir);
    return {
        mode: 'branch',
        workspace: targetDir,
        owned: true,
        kind: 'copy',
    };
}
export async function cleanupWorkspace(input) {
    if (input.mode === 'inherit')
        return;
    const target = resolve(input.workspace);
    if (!target || target === resolve(dirname(target)))
        return;
    if (input.baseCwd && target === resolve(input.baseCwd))
        return;
    if (input.mode === 'share') {
        const repoRoot = input.repoRoot ?? (input.baseCwd ? await detectGitRoot(input.baseCwd) : undefined);
        if (repoRoot) {
            try {
                await runGit(['worktree', 'remove', '--force', target], repoRoot);
            }
            catch {
                // Ignore git worktree remove errors; rm below cleans up the directory.
            }
            try {
                await runGit(['worktree', 'prune'], repoRoot);
            }
            catch {
                // Best-effort prune.
            }
        }
    }
    await rm(target, { recursive: true, force: true });
}
