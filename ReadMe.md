
# Vagrant Installation Scripts

This repository contains scripts to automate the installation of Vagrant on both Ubuntu and Windows operating systems. Below you'll find instructions on how to use each script.

## Ubuntu Installation

1. **Clone the Repository**: Clone this repository to your local machine.

2. **Run the Script**: Navigate to the directory containing the script and run the following commands:
   ```bash
   chmod +x install_vagrant.sh
   ./install_vagrant.sh
   ```

3. **Install Dependencies if Necessary**: If the script prompts you to install additional dependencies (wget, gpg, lsb-release), follow the on-screen instructions.

4. **Verify Installation**: You can verify that Vagrant has been installed successfully by running:
   ```bash
   vagrant --version
   ```

## Windows Installation

1. **Clone the Repository**: Clone this repository to your local machine.

2. **Run the Script**: Open PowerShell as an administrator and navigate to the directory containing the script. Run the script by executing:
   ```powershell
   .\install_vagrant.ps1
   ```

3. **Verify Installation**: You can verify that Vagrant has been installed successfully by running:
   ```powershell
   vagrant --version
   ```

## Important Note on Hyper-V and VirtualBox

If you have Hyper-V enabled on Windows Server editions and on Windows 10 Pro and Enterprise editions, you should not install VirtualBox as they are not compatible.

For other users, especially those on Windows Home edition or who do not have Hyper-V enabled, you should install VirtualBox. It can be downloaded from [here](https://www.virtualbox.org/).

## Support and Contributions

For support or to contribute, please open an issue or create a pull request.

## License

This project is licensed under the MIT License. See the `LICENSE.md` file for details.
```

This README file includes the basic instructions for both Ubuntu and Windows, along with the important note about Hyper-V and VirtualBox compatibility. 