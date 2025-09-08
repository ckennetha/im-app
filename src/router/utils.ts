import { Models } from "@/config"
import {
  DEFAULT_MODEL,
  DEFAULT_FEATURE,
  DEFAULT_FEATURE_MAX,
  ALLOWED_SEARCH_QUERY,
} from "@/cfg"
import type { RouteParamValue, RouteLocationNormalized, LocationQueryValue } from "vue-router"

export function firstStr<T extends RouteParamValue | LocationQueryValue>(
  rawValue: T | T[] | undefined
): string | null | undefined {
  return Array.isArray(rawValue) ? rawValue[0] : rawValue
}

export function clampFeature(
  feature: number, min: number, max: number
): number {
  return feature < min ? min : feature > max ? max : feature
}

export function sanitizeModel(raw: string | null | undefined): string | null {
  return typeof raw === 'string' && raw.trim().length > 0
    && Object.prototype.hasOwnProperty.call(Models, raw)
    ? raw : null
}

export function sanitizeFeature(
  raw: string | null | undefined, min: number, max: number
): number | null {
  const feature = Number.parseInt(raw ?? '', 10)
  return Number.isFinite(feature)
    ? clampFeature(feature, min, max) : null
}

export function sanitizeQuery(raw: string | null | undefined): string | undefined {
  return typeof raw === 'string' && raw.trim().length > 0
    ? raw : undefined
}

export function normalizeRouteExplore(
  to: RouteLocationNormalized, from: RouteLocationNormalized
) {
  const cModel = firstStr(to.params.model)
  const model = sanitizeModel(cModel)
    ?? from.params.model ?? DEFAULT_MODEL
  
  const cFeature = firstStr(to.params.feature)
  const feature = sanitizeFeature(
    cFeature, 0, DEFAULT_FEATURE_MAX
  ) ?? from.params.feature ?? DEFAULT_FEATURE

  const isChanged = model !== cModel || feature !== Number(cFeature)

  if (isChanged) {
    return {
      name: 'Explore',
      params: { model, feature },
      replace: true
    }
  }
}

export function normalizeRouteSearch(
  to: RouteLocationNormalized, from: RouteLocationNormalized
) {
  const cModel = firstStr(to.params.model)
  const model = sanitizeModel(cModel)
    ?? from.params.model ?? DEFAULT_MODEL
  
  const cQuerySmi = firstStr(to.query.smi)
  const smi = sanitizeQuery(cQuerySmi)

  const hasQueryNotAllowed = Object.keys(to.query).some(
    kq => !ALLOWED_SEARCH_QUERY.has(kq)
  )

  const isChanged = model !== cModel
    || smi !== cQuerySmi
    || hasQueryNotAllowed

  if (isChanged) {
    return {
      name: 'Search',
      params: { model },
      query: { smi },
      replace: true
    }
  }
}