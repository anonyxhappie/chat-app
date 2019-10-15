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

    this.websocket = new WebSocket('ws://localhost:' + this.port + '/');
    this.websocket.onopen = () => this.websocket.send({ action: 'plus' });
    console.log('trt', this.websocket);
    // this.websocket.send(JSON.stringify({action: 'plus'}));
    this.onWebsockectsMessageReceived();
    this.getUsers();
  }

  getMessages() {
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
    this.websocket.send(JSON.stringify({ action: 'message' }));
    return this.http.post('http://localhost:8000/text', body).subscribe((response: any) => {
      // console.log(response);
      this.message = '';
    });
  }

  getUsers() {
    return this.http.get('http://localhost:8000/users/').subscribe((data: any) => {
      this.users = data;
      this.currentUser = this.users[0];
      this.otherUser = this.users[1];
      this.getMessages();
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
    this.websocket.onopen = (event) => {
      console.log('On websocket open');
      console.log('::', event);
    };
    this.websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('On websocket message');
      console.log('::', event);
      // console.log('onWebsockectsMessageReceived::', data);
      // console.log(data['type']);
      if (data['type'] === 'users') {
        return;
      }
      this.messages = [...this.messages, data];
    };
    this.websocket.onerror = (event) => {
      console.log('On websocket error');
      console.log('::', event);
    };
    this.websocket.onclose = (event) => {
      console.log('On websocket close');
      console.log('::', event);
    };
  }

}
