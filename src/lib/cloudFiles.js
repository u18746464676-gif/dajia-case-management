/**
 * 云端文件管理 — 统一管理所有上传文件的元数据
 * 表结构 (Supabase):
 * CREATE TABLE cloud_files (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   case_id TEXT,                    -- 关联案件ID，未分配时为 NULL
 *   file_url TEXT NOT NULL,          -- TOS 上的文件 URL
 *   file_key TEXT NOT NULL,          -- TOS 上的对象 key（用于删除）
 *   file_name TEXT,                  -- 原始文件名
 *   file_type TEXT DEFAULT 'image',  -- image | file | other
 *   file_size BIGINT,               -- 文件大小（字节）
 *   uploaded_at TIMESTAMPTZ DEFAULT NOW(),
 *   deleted_at TIMESTAMPTZ           -- 软删除时间，为 NULL 表示未删除
 * );
 *
 * -- RLS 策略（可选，待用户配置）
 */

import { supabase } from '@/lib/supabase'

const TABLE = 'cloud_files'

// ── 建表（启动时自动执行） ──────────────────────────────
export async function ensureCloudFilesTable() {
  try {
    const { error } = await supabase.rpc('sql', {
      query: `
        CREATE TABLE IF NOT EXISTS ${TABLE} (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          case_id TEXT,
          file_url TEXT NOT NULL,
          file_key TEXT NOT NULL,
          file_name TEXT,
          file_type TEXT DEFAULT 'image',
          file_size BIGINT,
          uploaded_at TIMESTAMPTZ DEFAULT NOW(),
          deleted_at TIMESTAMPTZ
        );
      `,
    })
    // 忽略 error（权限不足时建表失败可忽略，仅影响统计功能）
  } catch (e) {
    // rpc 不可用则跳过
  }
}

// ── 上传后注册文件记录 ──────────────────────────────────
export async function registerCloudFile({ caseId = null, fileUrl, fileKey, fileName, fileType = 'image', fileSize }) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      case_id: caseId,
      file_url: fileUrl,
      file_key: fileKey,
      file_name: fileName,
      file_type: fileType,
      file_size: fileSize,
    })
    .select()
    .single()
  if (error) console.error('[cloud_files] register error:', error)
  return { data, error }
}

// ── 关联文件到案件 ──────────────────────────────────────
export async function attachFilesToCase(caseId, fileIds = []) {
  if (!fileIds.length) return
  const { error } = await supabase
    .from(TABLE)
    .update({ case_id: caseId })
    .in('id', fileIds)
    .is('deleted_at', null)
  if (error) console.error('[cloud_files] attach error:', error)
}

// ── 获取未分配的文件列表 ────────────────────────────────
export async function fetchUnassignedFiles() {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .is('deleted_at', null)
    .is('case_id', null)
    .order('uploaded_at', { ascending: false })
  if (error) console.error('[cloud_files] fetch unassigned error:', error)
  return data || []
}

// ── 获取案件的所有文件 ──────────────────────────────────
export async function fetchCaseFiles(caseId) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('case_id', caseId)
    .is('deleted_at', null)
    .order('uploaded_at', { ascending: false })
  if (error) console.error('[cloud_files] fetch case files error:', error)
  return data || []
}

// ── 批量获取案件的文件 URL ───────────────────────────────
export async function fetchCaseFileUrls(caseId) {
  const files = await fetchCaseFiles(caseId)
  return files.map(f => ({ url: f.file_url, key: f.file_key, id: f.id, name: f.file_name }))
}

// ── 软删除文件（从云端删除） ───────────────────────────
export async function deleteCloudFiles(fileIds = []) {
  if (!fileIds.length) return { error: null }
  const now = new Date().toISOString()
  const { error } = await supabase
    .from(TABLE)
    .update({ deleted_at: now })
    .in('id', fileIds)
  if (error) console.error('[cloud_files] soft delete error:', error)
  return { error }
}

// ── 根据 URL 软删除 ─────────────────────────────────────
export async function deleteCloudFilesByUrl(fileUrls = []) {
  if (!fileUrls.length) return { error: null }
  const now = new Date().toISOString()
  const { error } = await supabase
    .from(TABLE)
    .update({ deleted_at: now })
    .in('file_url', fileUrls)
  if (error) console.error('[cloud_files] soft delete by url error:', error)
  return { error }
}

// ── 彻底删除（云端删除后调用） ─────────────────────────
export async function purgeCloudFiles(fileIds = []) {
  if (!fileIds.length) return { error: null }
  const { error } = await supabase.from(TABLE).delete().in('id', fileIds)
  if (error) console.error('[cloud_files] purge error:', error)
  return { error }
}

// ── 获取所有已删除文件的 key（待彻底清理） ─────────────
export async function fetchOrphanedFileKeys(beforeDays = 7) {
  const cutoff = new Date(Date.now() - beforeDays * 86400000).toISOString()
  const { data, error } = await supabase
    .from(TABLE)
    .select('id, file_key')
    .not('deleted_at', 'is', null)
    .lt('deleted_at', cutoff)
  if (error) console.error('[cloud_files] fetch orphaned error:', error)
  return (data || []).map(r => ({ id: r.id, key: r.file_key }))
}
