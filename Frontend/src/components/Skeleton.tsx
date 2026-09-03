export interface SkeletonProps { width?: string; height?: string; }

export function Skeleton({ width = '100%', height = '32px' }: Readonly<SkeletonProps>) { return <div className="skeleton" aria-hidden="true" style={{ width, height }} />; }
