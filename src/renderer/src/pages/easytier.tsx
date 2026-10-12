import { Button, Card, Chip } from '@heroui/react'
import { IoMdRefresh } from 'react-icons/io'
import BasePage from '@renderer/components/base/base-page'
import { useEasyTier } from '@renderer/hooks/use-easytier'

const stateNames: Record<EasyTierStatus['state'], string> = {
  stopped: '已停止',
  created: '已创建',
  starting: '启动中',
  running: '运行中',
  stopping: '停止中'
}
const connectionNames: Record<EasyTierDevice['connection'], string> = {
  local: '本机',
  p2p: 'P2P 直连',
  relay: '转发',
  disconnected: '未连接'
}
const natName = (nat: string): string => (nat === 'Unknown' ? '未知' : nat)

export default function EasyTier(): React.JSX.Element {
  const { gateways, error, isLoading, isValidating, mutate } = useEasyTier()
  return (
    <BasePage
      title="EasyTier 网关"
      header={
        <Button
          isIconOnly
          size="sm"
          variant="ghost"
          className="app-nodrag"
          aria-label="刷新 EasyTier 网关"
          isDisabled={isValidating}
          onPress={() => {
            void mutate()
          }}
        >
          <IoMdRefresh className={`text-lg ${isValidating ? 'animate-spin' : ''}`} />
        </Button>
      }
    >
      <div className="p-2 space-y-2">
        <p className="px-2 text-xs text-foreground/60">每 5 秒自动刷新</p>
        {error ? (
          <Card>
            <Card.Content className="text-danger break-all">
              获取 EasyTier 网关失败：{String(error)}
            </Card.Content>
          </Card>
        ) : isLoading ? (
          <Card>
            <Card.Content>正在加载网关状态…</Card.Content>
          </Card>
        ) : gateways.length === 0 ? (
          <Card>
            <Card.Content>
              当前配置没有 EasyTier 网关。请在订阅或覆写中添加 type: easytier 代理。
            </Card.Content>
          </Card>
        ) : (
          gateways.map((gateway) => (
            <Card key={gateway.name}>
              <Card.Header className="flex-row items-center justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="font-bold break-all">{gateway.name}</h2>
                  {gateway.provider && (
                    <p className="text-xs text-foreground/60">代理集合：{gateway.provider}</p>
                  )}
                </div>
                <Chip
                  size="sm"
                  className={
                    gateway.error
                      ? 'text-danger'
                      : gateway.status?.state === 'running'
                        ? 'text-success'
                        : ''
                  }
                >
                  <Chip.Label>
                    {gateway.status ? stateNames[gateway.status.state] : '获取失败'}
                  </Chip.Label>
                </Chip>
              </Card.Header>
              <Card.Content className="pt-0">
                {!gateway.status ? (
                  <p className="text-danger text-sm break-all">{gateway.error}</p>
                ) : gateway.status.nodes.length === 0 ? (
                  <p className="text-sm text-foreground/60">暂无设备信息</p>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
                    {gateway.status.nodes.map((device) => (
                      <div key={device.peerId} className="rounded-lg bg-default/40 p-3 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-semibold break-all">
                              {device.hostname || '未命名设备'}
                            </h3>
                            <p className="text-xs text-foreground/60">Peer ID: {device.peerId}</p>
                          </div>
                          <Chip
                            size="sm"
                            className={
                              device.connection === 'disconnected' ? 'text-warning' : 'text-primary'
                            }
                          >
                            <Chip.Label>{connectionNames[device.connection]}</Chip.Label>
                          </Chip>
                        </div>
                        {device.connection === 'relay' && (
                          <p className="text-xs text-foreground/60 break-all">
                            经由{' '}
                            {gateway.status.nodes.find(
                              (node) => node.peerId === device.nextHopPeerId
                            )?.hostname || device.nextHopPeerId}
                          </p>
                        )}
                        <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1 text-sm">
                          <dt className="text-foreground/60">虚拟 IPv4</dt>
                          <dd className="text-right break-all">{device.ipv4 || '—'}</dd>
                          <dt className="text-foreground/60">UDP NAT</dt>
                          <dd className="text-right break-all">{natName(device.udpNat)}</dd>
                          <dt className="text-foreground/60">TCP NAT</dt>
                          <dd className="text-right break-all">{natName(device.tcpNat)}</dd>
                          <dt className="text-foreground/60">公网 IP</dt>
                          <dd className="text-right break-all">
                            {device.publicIPs?.join(', ') || '—'}
                          </dd>
                        </dl>
                      </div>
                    ))}
                  </div>
                )}
              </Card.Content>
            </Card>
          ))
        )}
      </div>
    </BasePage>
  )
}
