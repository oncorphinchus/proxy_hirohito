#!/bin/bash

# Linode Server Monitor - Backend Setup Script
# This script helps set up the backend monitoring component

set -e

echo "====================================================="
echo "Linode Server Monitor - Backend Setup"
echo "====================================================="

# Check if script is run as root
if [ "$EUID" -ne 0 ]; then
  echo "Please run this script as root or with sudo."
  exit 1
fi

# Detect OS
if [ -f /etc/os-release ]; then
    # freedesktop.org and systemd
    . /etc/os-release
    OS=$NAME
    VER=$VERSION_ID
elif type lsb_release >/dev/null 2>&1; then
    # linuxbase.org
    OS=$(lsb_release -si)
    VER=$(lsb_release -sr)
else
    # Fall back to uname
    OS=$(uname -s)
    VER=$(uname -r)
fi

echo "Detected OS: $OS $VER"

# Install dependencies based on OS
echo "Installing system dependencies..."
if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
    apt-get update
    apt-get install -y python3 python3-pip vnstat
elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]] || [[ "$OS" == *"Fedora"* ]]; then
    yum -y install epel-release
    yum -y install python3 python3-pip vnstat
else
    echo "Unsupported OS: $OS"
    echo "Please install Python 3, pip, and vnstat manually."
fi

# Install Python dependencies
echo "Installing Python dependencies..."
pip3 install -r requirements.txt

# Create .env file
echo "Setting up environment variables..."
if [ ! -f .env ]; then
    read -p "Enter your Supabase URL: " supabase_url
    read -p "Enter your Supabase service key: " service_key
    
    echo "SUPABASE_URL=$supabase_url" > .env
    echo "SUPABASE_SERVICE_KEY=$service_key" >> .env
    
    echo ".env file created successfully."
else
    echo ".env file already exists. Skipping creation."
fi

# Make script executable
echo "Making monitor.py executable..."
chmod +x monitor.py

# Set up cron job
echo "Setting up cron job..."
read -p "Would you like to set up a cron job to run the script every 5 minutes? (y/n): " setup_cron

if [[ "$setup_cron" == "y" ]] || [[ "$setup_cron" == "Y" ]]; then
    # Get absolute path to script
    script_path=$(readlink -f monitor.py)
    log_path="/var/log/server-monitor.log"
    
    # Create log file if it doesn't exist
    touch $log_path
    
    # Check if crontab entry already exists
    cron_check=$(crontab -l 2>/dev/null | grep "$script_path" || echo "")
    
    if [ -z "$cron_check" ]; then
        # Add to crontab
        (crontab -l 2>/dev/null; echo "*/5 * * * * $script_path >> $log_path 2>&1") | crontab -
        echo "Cron job added successfully."
    else
        echo "Cron job already exists. Skipping."
    fi
else
    echo "Skipping cron job setup."
fi

# Test the script
echo "Testing monitor.py..."
echo "This will run the script once to make sure everything works."
read -p "Do you want to test the script now? (y/n): " test_script

if [[ "$test_script" == "y" ]] || [[ "$test_script" == "Y" ]]; then
    echo "Running monitor.py..."
    ./monitor.py
    echo "Test complete."
else
    echo "Skipping test."
fi

echo "====================================================="
echo "Setup complete!"
echo "Your monitoring script is ready to use."
echo "====================================================="
echo "To manually run the script: ./monitor.py"
echo "Check logs at: /var/log/server-monitor.log"
echo "=====================================================" 