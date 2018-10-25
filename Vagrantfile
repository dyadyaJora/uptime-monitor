# -*- mode: ruby -*-
# vi: set ft=ruby :

VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  config.vm.box = "ubuntu/trusty64"
  config.vm.synced_folder "./", "/var/www/uptime-monitor"
  config.vm.network "forwarded_port", guest: 3002, host: 8080


  config.vm.provision :shell, path: "./shells/provisioner.sh"
  config.vm.provision :shell, path: "./shells/postinstall.sh", privileged: false
end
