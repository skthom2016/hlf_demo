# Check for necessary commands
Function Remove-HostEntry {
    param (
        [string]$HostName
    )

    $hostsPath = "C:\Windows\System32\drivers\etc\hosts"

    if (Select-String -Path $hostsPath -Pattern $HostName) {
        Write-Host "$HostName Found in your hosts file, Removing now..."
        (Get-Content $hostsPath) | Where-Object { $_ -notmatch $HostName } | Set-Content $hostsPath
    } else {
        Write-Host "$HostName was not found in your hosts file"
    }
}

Function Add-HostEntry {
    param (
        [string]$IP,
        [string]$HostName
    )

    $hostsPath = "C:\Windows\System32\drivers\etc\hosts"
    $hostsLine = "$IP`t$HostName"

    if (Select-String -Path $hostsPath -Pattern $HostName) {
        Write-Host "$HostName already exists : $(Select-String -Path $hostsPath -Pattern $HostName)"
    } else {
        Write-Host "Adding $HostName to your hosts file"
        Add-Content -Path $hostsPath -Value $hostsLine

        if (Select-String -Path $hostsPath -Pattern $HostName) {
            Write-Host "$HostName was added successfully `n $(Select-String -Path $hostsPath -Pattern $HostName)"
        } else {
            Write-Host "Failed to Add $HostName, Try again!"
        }
    }
}

# Specify the IP address
$IP = "127.0.0.1"

$hostNames = "peer1.oem.com", "peer1.dealer.com", "orderer.oem.com"

foreach ($HostName in $hostNames) {
    Remove-HostEntry -HostName $HostName
    Add-HostEntry -IP $IP -HostName $HostName
}

if (-Not (Get-Command "vagrant" -ErrorAction SilentlyContinue)) {
    Write-Host "Vagrant is not installed. Installing now..."

    # Download Vagrant MSI installer
    $url = "https://releases.hashicorp.com/vagrant/latest/vagrant.msi"
    $output = "vagrant.msi"

    Invoke-WebRequest -Uri $url -OutFile $output

    # Install Vagrant using the MSI installer
    Start-Process -FilePath "msiexec" -ArgumentList "/i", $output, "/qn" -Wait

    # Check if Vagrant is installed
    if (-Not (Get-Command "vagrant" -ErrorAction SilentlyContinue)) {
        Write-Host "Failed to install Vagrant. Please check your system configuration."
        Exit 1
    }

    Write-Host "Vagrant installed successfully!"
}
else {
    Write-Host "Vagrant is already installed!"
}

# Run vagrant up
Write-Host "Running vagrant up..."
vagrant up

# cd fdp_handson\docker\clientapp\typescript
# npm install 

Write-Host "Done!"
