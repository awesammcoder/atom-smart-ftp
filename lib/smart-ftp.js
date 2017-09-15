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
    class smartFTP {
      constructor(){
        this.bindEvents();
        //console.log(this);
        // bind directory onchange event
        //this.directoryEvents();
      }

      bindEvents(path = atom.project.getPaths()[0]){
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

      directoryEvents(path = atom.project.getPaths()[0]){
        //var directory = new Directory(path);

        // on directory changed event
        /*directory.onDidChange(function(){
          console.log("Directory Changed: ", directory);
        });*/

        // read all entries in the directory
        /*directory.getEntries(function(error, entry){
          console.log("Entry: ", entry);
        });*/
      }

      fileEvents(path){
        //var file = new File(path);

        // on file changed event
        /*file.onDidChange(function(){
          console.log("File changed: ", file);
        });*/
      }

      loadProject(path){
        atom.project.setPaths([path]);
        this.bindEvents(path);
      }
    }

    new smartFTP();
  }
};
