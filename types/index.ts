export interface ServerStats {
  id: number;
  created_at: string;
  cpu_percent: number;
  ram_percent: number;
  disk_percent: number;
  proxy_active: boolean;
  network_rx_bytes: number;
  network_tx_bytes: number;
} 