import { idToUuid } from "notion-utils"
import { ExtendedRecordMap, ID } from "notion-types"

export default function getAllPageIds(
  response: ExtendedRecordMap,
  viewId?: string,
  blockContent?: ID[]
) {
  const collectionQuery = response.collection_query
  const views = collectionQuery ? Object.values(collectionQuery)[0] : null

  let pageIds: ID[] = []

  if (views && Object.keys(views).length > 0) {
    if (viewId) {
      const vId = idToUuid(viewId)
      pageIds = views[vId]?.blockIds
    } else {
      const pageSet = new Set<ID>()
      // * type not exist
      Object.values(views).forEach((view: any) => {
        view?.collection_group_results?.blockIds?.forEach((id: ID) =>
          pageSet.add(id)
        )
      })
      pageIds = [...pageSet]
    }
  }

  // Fallback: use block content (child page IDs) when collection_query is empty
  if ((!pageIds || pageIds.length === 0) && blockContent) {
    pageIds = blockContent
  }

  return pageIds
}
