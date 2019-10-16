import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface User {
  user_id: string;
  user_name: string;
  full_name: string;
}

interface Message {
  message_id: string;
  message: string;
  sent_from: string;
  sent_to: string;
  created_at: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'chat-ui';
  messages: Message[] = [];
  users: User[] = [];
  currentUser: User = { full_name: 'Unknown', user_id: '', user_name: '' };
  otherUser: User;
  message: string;
  websocket: any;
  port = '6789';

  constructor(private http: HttpClient) {

    this.getUsers();
    // this.websocket.send(JSON.stringify({action: 'plus'}));
  }

  getMessages() {
    this.messages = [];
    return this.http.get(
      'http://localhost:8000/text?from=' +
      this.currentUser.user_id +
      '&to=' +
      this.otherUser.user_id).subscribe((data: any) => {
        this.messages = [...data];
        // console.log(this.messages);
      });
  }

  sendMessage() {
    const body = {
      sent_from: this.currentUser.user_id,
      sent_to: this.otherUser.user_id,
      message: this.message
    };
    console.log(this.websocket.readyState);
    if (this.websocket.readyState !== 1) {
      console.log('unable to send message:websocket.readyState:', this.websocket.readyState);
      console.log('establishing new socket connection');
      this.websocket = new WebSocket('ws://localhost:' + this.port + '/');
      this.websocket.send(JSON.stringify({ action: 'register', user: this.currentUser.user_id }));
      console.log('socket connection registered');
      // return;
    }

    // this.websocket.send(JSON.stringify({ action: 'register', user: this.currentUser.user_id }));
    this.websocket.send(JSON.stringify({ action: 'message' }));

    return this.http.post('http://localhost:8000/text', body).subscribe((response: any) => {
      // console.log(response);
      this.message = '';
      console.log('message sent');
    });
  }

  getUsers() {
    return this.http.get('http://localhost:8000/users/').subscribe((data: any) => {
      this.users = data;
      this.currentUser = this.users[0];
      this.otherUser = this.users[1];
      this.getMessages();
      console.log('establishing socket connection');
      this.websocket = new WebSocket('ws://localhost:' + this.port + '/');
      this.websocket.send(JSON.stringify({ action: 'register', user: this.currentUser.user_id }));
      console.log('socket connection registered');
      // if (this.websocket.readyState === WebSocket.OPEN) {
      //   this.websocket.send(JSON.stringify({ action: 'register', user: this.currentUser.user_id }));
      //   console.log({ action: 'register', user: this.currentUser.user_id }, this.websocket);
      // }

      this.onWebsockectsMessageReceived();
    });
  }

  getUsername(userid: string) {
    const u = this.users.filter(user => {
      return user.user_id === userid;
    });
    return u[0].user_name;
  }

  switchUsers() {
    const tempUser = { ...this.currentUser };
    this.currentUser = { ...this.otherUser };
    this.otherUser = { ...tempUser };
  }

  onCurrentUserChange() {
    this.getMessages();
  }

  onOtherUserChange() {
    this.getMessages();
  }

  onWebsockectsMessageReceived() {
    // if (this.websocket.readyState === WebSocket.OPEN) {
    this.websocket.addEventListener('message', (event) => {
      console.log('Message from server ', event.data);
      const data = JSON.parse(event.data);
      if (data['type'] === 'users') {
        console.log(data);
        return;
      }
      this.messages = [...this.messages, data];
    });
    // }
  }

}
