#!/bin/bash
# PATH TO YOUR HOSTS FILE
ETC_HOSTS=/etc/hosts

# DEFAULT IP FOR HOSTNAME
IP="127.0.0.1"


function removehost {
    if [ -n "$(grep $HOSTNAME /etc/hosts)" ]
    then
        echo "$HOSTNAME Found in your $ETC_HOSTS, Removing now..."
        sudo sed -i".bak" "/$HOSTNAME/d" $ETC_HOSTS
    else
        echo "$HOSTNAME was not found in your $ETC_HOSTS"
    fi
}

function addhost {
    HOSTNAME=$1
    HOSTS_LINE="$IP\t$HOSTNAME"
    if [ -n "$(grep $HOSTNAME /etc/hosts)" ]
        then
            echo "$HOSTNAME already exists : $(grep $HOSTNAME $ETC_HOSTS)"
        else
            echo "Adding $HOSTNAME to your $ETC_HOSTS";
            sudo -- sh -c -e "echo '$HOSTS_LINE' >> /etc/hosts";

            if [ -n "$(grep $HOSTNAME /etc/hosts)" ]
                then
                    echo "$HOSTNAME was added succesfully \n $(grep $HOSTNAME /etc/hosts)";
                else
                    echo "Failed to Add $HOSTNAME, Try again!";
            fi
    fi
}

# Check for necessary commands
if ! command -v wget &> /dev/null || ! command -v gpg &> /dev/null || ! command -v lsb_release &> /dev/null; then
  echo "Required commands are missing. Please install wget, gpg, and lsb-release."
  exit 1
fi

# Check if Vagrant is installed
vagrant --version &> /dev/null

if [ $? -ne 0 ]; then
  echo "Vagrant is not installed. Installing now..."
  
  # Update the package lists
  sudo apt-get update

  # Install Vagrant
wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg

echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list

sudo apt update && sudo apt install vagrant

  # Verify installation
  vagrant --version &> /dev/null
  if [ $? -ne 0 ]; then
    echo "Failed to install Vagrant. Please check your system configuration."
    exit 1
  fi

  echo "Vagrant installed successfully!"
else
  echo "Vagrant is already installed!"
fi

# Run vagrant up
echo "Running vagrant up..."
vagrant up

HOSTNAME=peer1.oem.com
removehost $HOSTNAME            &> /dev/null
addhost $HOSTNAME
HOSTNAME=peer1.dealer.com
removehost $HOSTNAME            &> /dev/null
addhost $HOSTNAME
HOSTNAME=orderer.oem.com
removehost $HOSTNAME            &> /dev/null
addhost $HOSTNAME

# cd fdp_handson/docker/clientapp/typescript
# npm install 

echo "Done!"
