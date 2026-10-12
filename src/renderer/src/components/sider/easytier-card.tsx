import { Button, Card, Chip } from '@heroui/react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { LuNetwork } from 'react-icons/lu'
import { useLocation } from 'react-router-dom'
import { useAppConfig } from '@renderer/hooks/use-app-config'
import { useEasyTier } from '@renderer/hooks/use-easytier'
import SiderItem from './sider-item'

interface Props {
  iconOnly?: boolean
  expanded?: boolean
}

export default function EasyTierCard({ iconOnly, expanded }: Props): React.JSX.Element {
  const { appConfig } = useAppConfig()
  const { easytierCardStatus = 'col-span-2', disableAnimation = false } = appConfig || {}
  const { gateways, error, isLoading } = useEasyTier()
  const match = useLocation().pathname.includes('/easytier')
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: 'easytier'
  })
  const running = gateways.filter((gateway) => gateway.status?.state === 'running').length
  const hasError = Boolean(error) || gateways.some((gateway) => gateway.error)
  const online = gateways.reduce(
    (count, gateway) =>
      count +
      (gateway.status?.nodes.filter(
        (node) => node.connection === 'p2p' || node.connection === 'relay'
      ).length ?? 0),
    0
  )
  const summary = hasError
    ? '状态获取失败'
    : isLoading
      ? '加载中'
      : gateways.length
        ? `${running}/${gateways.length} 运行 · ${online} 在线设备`
        : '未配置'
  const foreground = match ? 'text-primary-foreground' : 'text-foreground'

  if (iconOnly) {
    return (
      <SiderItem
        className={easytierCardStatus}
        title="EasyTier 网关"
        route="/easytier"
        icon={<LuNetwork className="text-[20px]" />}
        expanded={expanded}
      />
    )
  }

  return (
    <div
      ref={setNodeRef}
      className={`${easytierCardStatus} easytier-card`}
      style={{
        position: 'relative',
        transform: CSS.Transform.toString(
          transform && {
            ...transform,
            scaleX: 1,
            scaleY: 1
          }
        ),
        transition,
        zIndex: isDragging ? 'calc(infinity)' : undefined
      }}
    >
      <Card
        {...attributes}
        {...listeners}
        className={`w-full ${match ? 'bg-primary' : 'hover:bg-primary/30'} ${isDragging && !disableAnimation ? 'scale-[0.95]' : ''}`}
      >
        <Card.Content className="pb-1 pt-0 px-0 overflow-y-visible">
          <div className="flex justify-between">
            <Button isIconOnly variant="secondary" className="bg-transparent pointer-events-none">
              <LuNetwork className={`text-[24px] ${foreground}`} />
            </Button>
            <Chip
              size="sm"
              variant="tertiary"
              data-outline="true"
              className={`mr-2 mt-2 ${match ? 'border-primary-foreground text-primary-foreground' : hasError ? 'border-danger text-danger' : 'border-primary text-primary'}`}
            >
              <Chip.Label>{hasError ? '!' : `${running}/${gateways.length}`}</Chip.Label>
            </Chip>
          </div>
        </Card.Content>
        <Card.Footer className="pt-1 flex-col items-start gap-1">
          <h3 className={`text-md font-bold ${foreground}`}>EasyTier 网关</h3>
          <p className={`text-xs opacity-70 ${foreground}`}>{summary}</p>
        </Card.Footer>
      </Card>
    </div>
  )
}
