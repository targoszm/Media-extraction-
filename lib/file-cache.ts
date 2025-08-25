interface CachedFile {
  id: string
  fileName: string
  fileType: string
  data: string
  uploadedAt: number
  lastAccessed: number
  size: number
}

class FileCache {
  private cache = new Map<string, CachedFile>()
  private readonly MAX_CACHE_SIZE = 100 // Maximum number of files to cache
  private readonly MAX_FILE_AGE = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

  generateFileId(fileName: string, fileType: string, data: string): string {
    // Generate a consistent ID based on file content
    const hash = this.simpleHash(fileName + fileType + data.substring(0, 1000))
    return `file_${hash}_${Date.now()}`
  }

  private simpleHash(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36)
  }

  store(fileName: string, fileType: string, data: string): string {
    const fileId = this.generateFileId(fileName, fileType, data)

    // Check if file already exists
    if (this.cache.has(fileId)) {
      const existing = this.cache.get(fileId)!
      existing.lastAccessed = Date.now()
      console.log(`[v0] File cache hit: ${fileName}`)
      return fileId
    }

    // Clean up old files if cache is full
    this.cleanup()

    const cachedFile: CachedFile = {
      id: fileId,
      fileName,
      fileType,
      data,
      uploadedAt: Date.now(),
      lastAccessed: Date.now(),
      size: data.length,
    }

    this.cache.set(fileId, cachedFile)
    console.log(`[v0] File cached: ${fileName} (${fileId})`)
    return fileId
  }

  retrieve(fileId: string): CachedFile | null {
    const file = this.cache.get(fileId)
    if (file) {
      file.lastAccessed = Date.now()
      console.log(`[v0] File cache retrieved: ${file.fileName}`)
      return file
    }
    return null
  }

  private cleanup() {
    if (this.cache.size < this.MAX_CACHE_SIZE) return

    const now = Date.now()
    const filesToDelete: string[] = []

    // Remove old files
    for (const [id, file] of this.cache.entries()) {
      if (now - file.lastAccessed > this.MAX_FILE_AGE) {
        filesToDelete.push(id)
      }
    }

    // If still too many files, remove least recently used
    if (this.cache.size - filesToDelete.length >= this.MAX_CACHE_SIZE) {
      const sortedFiles = Array.from(this.cache.entries()).sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed)

      const additionalToDelete = this.cache.size - filesToDelete.length - this.MAX_CACHE_SIZE + 10
      for (let i = 0; i < additionalToDelete; i++) {
        filesToDelete.push(sortedFiles[i][0])
      }
    }

    filesToDelete.forEach((id) => {
      const file = this.cache.get(id)
      if (file) {
        console.log(`[v0] File cache evicted: ${file.fileName}`)
        this.cache.delete(id)
      }
    })
  }

  getCacheStats() {
    return {
      totalFiles: this.cache.size,
      totalSize: Array.from(this.cache.values()).reduce((sum, file) => sum + file.size, 0),
      oldestFile: Math.min(...Array.from(this.cache.values()).map((f) => f.uploadedAt)),
      newestFile: Math.max(...Array.from(this.cache.values()).map((f) => f.uploadedAt)),
    }
  }
}

export const fileCache = new FileCache()
