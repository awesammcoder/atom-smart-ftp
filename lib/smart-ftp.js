'use babel';

import SmartFtpView from './smart-ftp-view';
import { CompositeDisposable } from 'atom';
import { Directory } from 'atom';
import { File } from 'atom';

export default {

  smartFtpView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.smartFtpView = new SmartFtpView(state.smartFtpViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.smartFtpView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'smart-ftp:startFTP': () => this.startFTP()
    }));

    // Initialize smartFTP on Activate of this plugins
    this.smartFTP = this.loadFTP();
    this.smartFTP.modalPanel = this.modalPanel;
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.smartFtpView.destroy();
  },

  serialize() {
    return {
      smartFtpViewState: this.smartFtpView.serialize()
    };
  },

  startFTP() {
    if(this.modalPanel.visible){
      this.modalPanel.hide();
    }else{
      this.modalPanel.show();
    }
  },

  loadFTP(){
    class FTPProfile {
      constructor(){
        var count = JSON.parse(localStorage.smartFTP).profiles.length;
        this.id = +count + 1;
        this.name = `Untitled ${+count + 1}`;
        this.host = '';
        this.port = 21;
        this.username = 'anonymous';
        this.password = 'anonymous';
      }
    }

    class smartFTP {
      constructor(){
        // Initialize jsFTP
        this.JSFtp = require('jsftp');
        this.bindViewEvents();
        //console.log(this);
        // bind directory onchange event
        //this.directoryEvents();
      }

      bindFileEvents(path = atom.project.getPaths()[0]){
        var chokidar = require('chokidar');
        var watcher = chokidar.watch(path, {ignored: /(^|[\/\\])\../}, {
          persistent: true
        });

        watcher.on('error', error => console.log(`error: ${error}`));
        watcher.on('ready', function(){
          // file events
          watcher.on('add', path => console.log(`File ${path} added`));
          watcher.on('change', path => console.log(`File ${path} changed`));
          watcher.on('unlink', path => console.log(`File ${path} removed`));

          // dir events
          watcher.on('addDir', path => console.log(`Dir ${path} added.`));
          watcher.on('unlinkDir', path => console.log(`Dir ${path} removed`));
          console.log("Initialized Scan on directory");
        });
      }

      saveStorageState(){
        localStorage.smartFTP = JSON.stringify(this.smartFTP);
      }

      bindViewEvents(){
          var selected_profile = document.getElementById('ftp-profile');
          var button_add_profile = document.getElementById('btn-new');
          var button_delete_profile = document.getElementById('btn-delete');
          var button_connect = document.getElementById('btn-connect');
          var button_cancel = document.getElementById('btn-cancel');
          var ftp_form = document.getElementById('ftp-form');

          var profile = {
            name: document.getElementById('ftp_name'),
            host: document.getElementById('ftp_host'),
            port: document.getElementById('ftp_port'),
            username: document.getElementById('ftp_username'),
            password: document.getElementById('ftp_password')
          };

          // select element on change events
          selected_profile.addEventListener('change', ()=> {
            ftp_form.reset(); // clears ftp form inputs
            button_delete_profile.style.visibility = 'visible';
            button_connect.style.visibility = 'visible';

            // load specific ftp profile from localStorage
            for(var i=0; i < this.smartFTP.profiles.length; i++){
              if(this.smartFTP.profiles[i].id == selected_profile.value){
                profile.name.value = this.smartFTP.profiles[i].name;
                profile.host.value = this.smartFTP.profiles[i].host;
                profile.port.value = this.smartFTP.profiles[i].port;
                profile.username.value = this.smartFTP.profiles[i].username;
                profile.password.value = this.smartFTP.profiles[i].password;

                break;
              }
            }
          });

          // on add new profile button click
          button_add_profile.addEventListener('click', ()=> {
            this.smartFTP.profiles.push(new FTPProfile());
            this.saveStorageState();
            this.loadHTMLContent(selected_profile);
            ftp_form.reset();
          });

          // on delete button click
          button_delete_profile.addEventListener('click', ()=> {
            for(var i=0; i < this.smartFTP.profiles.length; i++){
              if(this.smartFTP.profiles[i].id == selected_profile.value){
                this.smartFTP.profiles.splice(this.smartFTP.profiles[i].id - 1, 1);
                this.saveStorageState();
                this.loadHTMLContent(selected_profile);
                ftp_form.reset();
                break;
              }
            }
          });

          // on connect button click
          button_connect.addEventListener('click', ()=> {
            // save changes in ftp profile
            var ftp_id = selected_profile.value;

            this.saveFTPProfile(selected_profile, profile);
            ftp_form.reset();
            this.modalPanel.hide();

            for(var i=0; i < this.smartFTP.profiles.length; i++){
              if(this.smartFTP.profiles[i].id == ftp_id){
                this.connectFTP(this.smartFTP.profiles[i]);
              }
            }

          });

          // on cancel connect button click
          button_cancel.addEventListener('click', ()=> {
            this.modalPanel.hide();
          });

          this.loadHTMLContent(selected_profile);
      }

      connectFTP(profile){
        this.ftpSession = new this.JSFtp({
          host: profile.host,
          port: profile.port,
          user: profile.username,
          pass: profile.password
        });

        this.ftpSession.auth(profile.username, profile.password, function(err, res){
          if(res){
            atom.notifications.addSuccess(`Successfully connected to ${profile.host}`,{});
          }else{
            atom.notifications.addError(`Connection failed to ${profile.host}`,{});
          }
        })
      }

      loadHTMLContent(selected_profile){
          document.getElementById('ftp-profile').hidden = true;
          selected_profile.innerHTML = this.loadProfiles();
      }

      saveFTPProfile(selected_profile, profile){
        for(var i=0; i < this.smartFTP.profiles.length; i++){
          if(this.smartFTP.profiles[i].id == selected_profile.value){
            var ftp =  this.smartFTP.profiles[i];
            ftp.name = profile.name.value;
            ftp.host = profile.host.value;
            ftp.port = profile.port.value;
            ftp.username = profile.username.value;
            ftp.password = profile.password.value;

            break;
          }
        }

        this.saveStorageState();
        this.loadHTMLContent(selected_profile);
      }

      loadProfiles(){
          if(!localStorage.smartFTP){
            localStorage.smartFTP = JSON.stringify({
              profiles: []
            });
          }

          this.smartFTP = JSON.parse(localStorage.smartFTP);
          document.getElementById('btn-delete').style.visibility = 'hidden';
          document.getElementById('btn-connect').style.visibility = 'hidden';

          var ftp_profiles = this.smartFTP.profiles;
          var profiles = `<option selected disabled>Select profile</option>`;
          for(var i=0; i < ftp_profiles.length; i++){
                profiles += `<option value="${ftp_profiles[i].id}">${ftp_profiles[i].name}</option>`;
          }
          return profiles;
      }

      loadProject(path){
        atom.project.setPaths([path]);
        this.bindFileEvents(path);
      }
    }

    return new smartFTP();
  }
};
