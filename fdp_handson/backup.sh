#mkdir ../backup;
echo '============================='
echo 'Copying to local machine'
echo '============================='
mkdir -p ../backup/latest
find . -name '*.ts' -exec cp --parents \{\} ../backup/latest \;
find . -name '*.sh' -exec cp --parents \{\} ../backup/latest \;
find . -name '*.yaml' -exec cp --parents \{\} ../backup/latest \;
find . -name '*.json' -exec cp --parents \{\} ../backup/latest \;

echo '============================='
echo 'Copying to shared drive'
echo '============================='
mkdir -p /media/sf_vmshare/backup/latest
find . -name '*.ts' -exec cp --parents \{\} /media/sf_vmshare/backup/latest \;
find . -name '*.sh' -exec cp --parents \{\} /media/sf_vmshare/backup/latest \;
find . -name '*.yaml' -exec cp --parents \{\} /media/sf_vmshare/backup/latest \;
find . -name '*.json' -exec cp --parents \{\} /media/sf_vmshare/backup/latest \;

