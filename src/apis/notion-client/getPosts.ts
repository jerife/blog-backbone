import { CONFIG } from "site.config"
import { NotionAPI } from "notion-client"
import { idToUuid } from "notion-utils"

import getAllPageIds from "src/libs/utils/notion/getAllPageIds"
import getPageProperties from "src/libs/utils/notion/getPageProperties"
import { TPosts } from "src/types"

/**
 * @param {{ includePages: boolean }} - false: posts only / true: include pages
 */

// TODO: react query를 사용해서 처음 불러온 뒤로는 해당데이터만 사용하도록 수정
export const getPosts = async () => {
  let id = CONFIG.notionConfig.pageId as string
  const api = new NotionAPI()

  const response = await api.getPage(id)
  id = idToUuid(id)

  const collection = (Object.values(response.collection)[0]?.value as any)?.value
  const block = response.block
  const schema = collection?.schema

  const rawMetadata = (block[id]?.value as any)?.value

  // Check Type
  if (
    rawMetadata?.type !== "collection_view_page" &&
    rawMetadata?.type !== "collection_view"
  ) {
    return []
  } else {
    // Construct Data
    const pageIds = getAllPageIds(response, undefined, rawMetadata?.content)
    const data = []

    for (let i = 0; i < pageIds.length; i++) {
      const pageId = pageIds[i]

      // Fetch child page individually if not in initial response
      if (!block[pageId]?.value) {
        try {
          const pageResponse = await api.getPage(pageId)
          Object.assign(block, pageResponse.block)
        } catch (e) {
          continue
        }
      }
      if (!block[pageId]?.value) continue

      const properties = (await getPageProperties(pageId, block, schema)) || null
      if (!properties) continue
      // Add fullwidth, createdtime to properties
      properties.createdTime = new Date(
        (block[pageId].value as any)?.value?.created_time
      ).toString()
      properties.fullWidth =
        (block[pageId].value as any)?.value?.format?.page_full_width ?? false

      data.push(properties)
    }

    // Sort by date
    data.sort((a: any, b: any) => {
      const dateA: any = new Date(a?.date?.start_date || a.createdTime)
      const dateB: any = new Date(b?.date?.start_date || b.createdTime)
      return dateB - dateA
    })

    // Replace undefined with null for Next.js serialization
    const posts = JSON.parse(JSON.stringify(data, (_, v) => v === undefined ? null : v)) as TPosts
    return posts
  }
}
