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
  currentUser: User;
  otherUser: User;
  message: string;
  websocket: any;
  port = '6789';

  constructor(private http: HttpClient) {
    this.websocket = new WebSocket('ws://localhost:' + this.port + '/');
    // this.websocket.send(JSON.stringify({action: 'plus'}));
    this.onWebsockectsMessageReceived();
    this.getUsers();
    this.getMessages();
  }

  setWebSocket() {
    this.websocket = new WebSocket('ws://localhost:' + this.port + '/');
  }

  getMessages() {
    return this.http.get('http://localhost:8000/messages/').subscribe((data: any) => {
      this.messages = [...data];
      console.log(this.messages);
    });
  }

  sendMessage() {
    const body = {
      sent_from: this.currentUser.user_id,
      sent_to: this.otherUser.user_id,
      message: this.message
    };
    console.log(body);
    this.websocket.send(JSON.stringify({action: 'plus'}));
    return this.http.post('http://localhost:8000/text', {
      sent_from: this.currentUser.user_id,
      sent_to: this.otherUser.user_id,
      message: this.message
    }).subscribe((response: any) => {
      console.log(response);
      this.message = '';
    });
  }

  getUsers() {
    return this.http.get('http://localhost:8000/users/').subscribe((data: any) => {
      this.users = data;
      this.currentUser = this.users[0];
      this.otherUser = this.users[1];
      console.log(this.users);
      console.log('from:', this.currentUser.user_name);
      console.log('to:', this.otherUser.user_name);
    });
  }

  getUsername(userid: string) {
    const u = this.users.filter(user => {
      return user.user_id === userid;
    });
    return u[0].user_name;
  }

  onCurrentUserChange() {
    this.otherUser = this.users.filter(user => {
      return user.user_id !== this.currentUser.user_id;
    })[0];
    console.log('from:', this.currentUser.user_name);
    console.log('to:', this.otherUser.user_name);
  }

  onWebsockectsMessageReceived() {
    this.websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(data);
      this.messages = [...this.messages, data];
    };
  }
}
