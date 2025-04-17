#!/usr/bin/env python3
"""
Linode Server Monitor - Backend Script
This script collects server metrics and sends them to a Supabase database.
"""

import os
import time
import json
import psutil
import subprocess
import requests
from dotenv import load_dotenv

# Load environment variables from .env file (create one with your Supabase credentials)
load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")  # Use the service key for the backend

# Check if environment variables are set
if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: Missing environment variables. Please set SUPABASE_URL and SUPABASE_SERVICE_KEY.")
    exit(1)

def check_proxy_active():
    """Check if the proxy service is running."""
    try:
        # Replace 'your_proxy_service' with your actual proxy service name
        # For example: 'nginx', 'squid', 'v2ray', etc.
        proxy_service = 'nginx'  # Update this to your actual proxy service
        
        result = subprocess.run(
            ['systemctl', 'is-active', proxy_service], 
            capture_output=True, 
            text=True
        )
        return result.stdout.strip() == 'active'
    except Exception as e:
        print(f"Error checking proxy status: {e}")
        return False

def get_network_bytes():
    """Get network RX and TX bytes."""
    try:
        # Try to use vnstat for more accurate readings if available
        if os.path.exists('/usr/bin/vnstat'):
            # Get total bytes from vnstat
            result = subprocess.run(
                ['vnstat', '--json'], 
                capture_output=True, 
                text=True
            )
            data = json.loads(result.stdout)
            # Get the total from the first interface
            interface = data['interfaces'][0]
            total = interface['traffic']['total']
            return total['rx'], total['tx']
        else:
            # Fallback to psutil if vnstat is not available
            net_io = psutil.net_io_counters()
            return net_io.bytes_recv, net_io.bytes_sent
    except Exception as e:
        print(f"Error getting network bytes: {e}")
        return 0, 0

def collect_metrics():
    """Collect server metrics."""
    try:
        # CPU usage (percentage)
        cpu_percent = psutil.cpu_percent(interval=1)
        
        # Memory usage (percentage)
        memory = psutil.virtual_memory()
        ram_percent = memory.percent
        
        # Disk usage for root partition (percentage)
        disk = psutil.disk_usage('/')
        disk_percent = disk.percent
        
        # Check if proxy is active
        proxy_active = check_proxy_active()
        
        # Get network bytes
        network_rx_bytes, network_tx_bytes = get_network_bytes()
        
        return {
            "cpu_percent": cpu_percent,
            "ram_percent": ram_percent,
            "disk_percent": disk_percent,
            "proxy_active": proxy_active,
            "network_rx_bytes": network_rx_bytes,
            "network_tx_bytes": network_tx_bytes
        }
    except Exception as e:
        print(f"Error collecting metrics: {e}")
        return None

def send_to_supabase(metrics):
    """Send metrics to Supabase."""
    try:
        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal"
        }
        
        response = requests.post(
            f"{SUPABASE_URL}/rest/v1/server_stats",
            headers=headers,
            json=metrics
        )
        
        if response.status_code == 201:
            print("Metrics sent successfully!")
        else:
            print(f"Error sending metrics. Status code: {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error sending metrics to Supabase: {e}")

def main():
    """Main function to collect and send metrics."""
    print("Starting Linode Server Monitor...")
    
    metrics = collect_metrics()
    if metrics:
        print("Collected metrics:", json.dumps(metrics, indent=2))
        send_to_supabase(metrics)
    else:
        print("Failed to collect metrics")

if __name__ == "__main__":
    main() 