'use babel';

export default class SmartFtpView {

  constructor(serializedState) {
    this.appendStyle();
    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('smart-ftp');
    this.element.id = 'container';
    this.element.innerHTML = `
        <div class="container">
            <h2>SmartFTP</h2>
        </div>
        <div class="row">
            <div class="col-4">
                <select id="ftp-profile" class="form-control"></select>
                <div class="btn-operations">
                    <button class="btn" id="btn-new">New Profile</button>
                    <button class="btn" id="btn-delete">Remove</button>
                </div>
            </div>
            <div class="col-8">
                <div id="profile">
                    <form id="ftp-form">
                        <input class="form-control" type="text" id="ftp_name" placeholder="Profile Name">
                        <input class="form-control" type="text" id="ftp_host" placeholder="Host">
                        <input class="form-control" type="number" id="ftp_port" placeholder="Port">
                        <input class="form-control" type="text" id="ftp_username" placeholder="Username">
                        <input class="form-control" type="text" id="ftp_password" placeholder="Password">
                    </form>
                    
                    <div class="align-right">
                        <button id="btn-connect" class="btn">Connect</button>
                        <button id="btn-cancel" class="btn">Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    `;
  }

  appendStyle(){
    document.querySelector('head').innerHTML += `
      <style>
          .form-control {
              margin-bottom: 5px;
          }

          .container {
            padding: 0 5px;
          }

          .row {
              display: flex;
          }

          .col-4 {
            padding: 0 5px;
            width: calc((4/12) * 100%);
          }

          .col-8 {
            padding: 0 5px;
            width: calc((8/12) * 100%);
          }

          .btn-operations {
            display: flex;
          }

          .btn-operations button {
            display: flex;
            flex-grow: 1;
          }

          .align-right {
            text-align: right;
          }
      </style>
    `;
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

}
