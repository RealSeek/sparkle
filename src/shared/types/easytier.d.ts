interface EasyTierDevice {
  peerId: number
  hostname: string
  ipv4: string
  connection: 'local' | 'p2p' | 'relay' | 'disconnected'
  nextHopPeerId?: number
  udpNat: string
  tcpNat: string
  publicIPs: string[] | null
}

interface EasyTierStatus {
  state: 'stopped' | 'created' | 'starting' | 'running' | 'stopping'
  nodes: EasyTierDevice[]
}

interface EasyTierControllerStatus {
  state: EasyTierStatus['state']
  node: {
    'peer-id': number
    hostname: string
    ipv4: string
    'udp-nat'?: string
    'tcp-nat'?: string
    'public-ips'?: string[] | null
  } | null
  peers: { 'peer-id': number; connections: { closed: boolean }[] }[]
  routes: {
    'peer-id': number
    hostname: string
    ipv4: string
    'next-hop-peer-id': number
    'next-hop-peer-id-latency-first'?: number
    'udp-nat'?: string
    'tcp-nat'?: string
    'public-ips'?: string[] | null
  }[]
}

type EasyTierGateway = {
  name: string
  provider?: string
} & ({ status: EasyTierStatus; error?: never } | { status?: never; error: string })
