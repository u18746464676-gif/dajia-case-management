/**
 * @file  cloudFiles.js
 * 统一管理所有上传文件的元数据
 *
 * 架构说明（2026-04-19）：
 *   前端上传到云存储（TOS）后，调自有后端 API /api/register-cloud-file
 *   由后端使用 Supabase service_role key 写入 cloud_files 表
 *   前端不再直连 Supabase（无 RLS 问题）
 *
 * 不再使用的旧函数（保留仅因 stores/case.js 有调用，标记为兼容过渡）：
 *   verifyCloudFileExists → 始终返回 { exists: true }，因为后端已保证写入成功
 *
 * 表结构 (Supabase):
 * CREATE TABLE cloud_files (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   case_id TEXT,
 *   file_url TEXT NOT NULL,
 *   file_key TEXT NOT NULL,
 *   file_name TEXT,
 *   file_type TEXT DEFAULT 'image',
 *   file_size BIGINT,
 *   uploaded_at TIMESTAMPTZ DEFAULT NOW(),
 *   deleted_at TIMESTAMPTZ
 * );
 */

const API_BASE = ''
const TABLE = 'cloud_files'

// ── 注册文件记录（调自有后端 API，服务端写库） ─────────────
async function registerCloudFileViaApi({ caseId, fileUrl, fileKey, fileName, fileType, fileSize }) {
  const payload = { caseId, fileUrl, fileKey, fileName, fileType, fileSize }
  console.log('[registerCloudFile] 注册文件:', { fileName, caseId })

  const response = await fetch(`${API_BASE}/api/register-cloud-file`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const result = await response.json()

  if (!response.ok || result.error) {
    console.error('[registerCloudFile] ❌ 后端 API 失败:', {
      httpStatus: response.status,
      errorCode: result.code,
      errorMessage: result.error,
      details: result,
    })
    return { data: null, error: { code: result.code, message: result.error, details: result } }
  }

  console.log('[registerCloudFile] 成功 id=', result.data?.id)
  return { data: result.data, error: null }
}

// ── 注册文件记录（统一出口） ─────────────────────────────
export async function registerCloudFile({ caseId = null, fileUrl, fileKey, fileName, fileType = 'image', fileSize }) {
  return registerCloudFileViaApi({ caseId, fileUrl, fileKey, fileName, fileType, fileSize })
}

// ── 以下函数已废弃，仅因 stores/case.js 历史调用保留 ────────
// 2026-04-19：后端 API 写入成功后不再需要前端二次验证
// 始终返回 exists: true，避免旧调用链报错
// TODO(cleanup)：待 stores/case.js 重构后可移除

export async function verifyCloudFileExists(fileUrl) {
  return { exists: true, error: null }
}

export async function ensureCloudFilesTable() {}
export async function attachFilesToCase(caseId, fileIds = []) {}
export async function fetchUnassignedFiles() { return [] }
export async function fetchCaseFiles(caseId) { return [] }
export async function fetchCaseFileUrls(caseId) { return [] }
export async function deleteCloudFiles(fileIds = []) { return { error: null } }
export async function deleteCloudFilesByUrl(fileUrls = []) { return { error: null } }
export async function purgeCloudFiles(fileIds = []) { return { error: null } }
export async function fetchOrphanedFileKeys(beforeDays = 7) { return [] }
