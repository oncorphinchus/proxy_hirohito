# Linode Server Monitor - Backend

This is the backend component of the Linode Server Monitoring System. It collects server metrics and sends them to a Supabase database for display in the frontend dashboard.

## Requirements

- Python 3.7 or higher
- `psutil` for collecting system metrics
- `requests` for sending data to Supabase
- `python-dotenv` for environment variable management
- (Optional) `vnstat` for more accurate network traffic measurement

## Setup

1. Install system dependencies:
   ```bash
   # For Debian/Ubuntu
   sudo apt-get update && sudo apt-get install -y python3-pip vnstat
   
   # For CentOS/RHEL
   sudo yum install -y python3-pip vnstat
   ```

2. Install Python dependencies:
   ```bash
   pip3 install -r requirements.txt
   ```

3. Create a `.env` file in the same directory as the script:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_KEY=your_supabase_service_key
   ```
   
   Note: Use the **service key** (not the anon key) from your Supabase project for server-side operations.

4. Make the script executable:
   ```bash
   chmod +x monitor.py
   ```

5. Test run the script:
   ```bash
   ./monitor.py
   ```

## Setting Up Automatic Collection (Cron)

1. Edit your crontab:
   ```bash
   crontab -e
   ```

2. Add a line to run the script every 5 minutes (adjust the path as needed):
   ```
   */5 * * * * /path/to/monitor.py >> /var/log/server-monitor.log 2>&1
   ```

3. Check if cron is running:
   ```bash
   systemctl status cron
   ```

## Customization

- Edit the `check_proxy_active()` function to check for your specific proxy service.
- Modify the script to collect additional metrics as needed.
- Adjust the collection frequency by changing the cron schedule.

## Troubleshooting

- Check the log file at `/var/log/server-monitor.log` for errors.
- Ensure your Supabase database has the correct schema with a `server_stats` table.
- Verify that your Linode server has outbound access to the Supabase API. 