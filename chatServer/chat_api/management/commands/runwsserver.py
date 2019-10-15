#!/usr/bin/env python

# WS server example that synchronizes state across clients

import asyncio
import json
import logging
import websockets
import datetime
import random
from django.core.management.base import BaseCommand
from chatServer.settings import KAFKA_CONSUMER as kfk_consumer

logging.basicConfig()

STATE = {'value': 0}

USERS = set()


def state_event():
    return json.dumps({'type': 'state', **STATE})


def users_event():
  return json.dumps({'type': 'users', 'count': len(USERS)})


async def notify_state():
    if USERS:  # asyncio.wait doesn't accept an empty list
      message = state_event()
      await asyncio.wait([user.send(message) for user in USERS])

async def notify_users():
    if USERS:  # asyncio.wait doesn't accept an empty list
      message = users_event()
      await asyncio.wait([user.send(message) for user in USERS])

async def notify_msg_to_users():
    if USERS:  # asyncio.wait doesn't accept an empty list
      # filter users from ids
      print('kfk consumer', kfk_consumer)
      for msg in kfk_consumer:
          print('send message', msg)
          print(msg.value)
          message = json.dumps(msg.value)
          await asyncio.wait([user.send(message) for user in USERS])
          print('notified to all')
      print('out of kfk consumer')


async def register(websocket):
    print('Adding websocket to USERS..')
    print(websocket)
    USERS.add(websocket)
    await notify_users()


async def unregister(websocket):
    USERS.remove(websocket)
    await notify_users()


async def counter(websocket, path):
    # register(websocket) sends user_event() to websocket
    print('Registering websocket..')
    await register(websocket)
    try:
        print('await websocket.send(state_event())..')
        # await websocket.send(state_event())
        async for message in websocket:
            data = json.loads(message)
            print('received event: ', data)
            if data['action'] == 'minus':
                STATE['value'] -= 1
                await notify_state()
            elif data['action'] == 'plus':
                STATE['value'] += 1
                await notify_state()
            elif data['action'] == 'message':
                await notify_msg_to_users()
            else:
                print('unsupported event: ', data)
                logging.error('unsupported event: {}', data)
    finally:
        await unregister(websocket)


class Command(BaseCommand):

    def add_arguments(self, parser):
        # Positional arguments
        parser.add_argument(
            'port',
            nargs='?',
            default=6789,
            help='Port number where websocket server will listen to.',
            type=int,
        )

        # Named (optional) arguments
        # parser.add_argument(
        #     '--port',
        #     action='store_true',
        #     help='Port number where websocket server will listen to.',
        # )

    def handle(self, *args, **options):
        print('Running websockets server....')
        wsport = options.get('port')
        if wsport < 0 or wsport > 65535:
            print('Invalid port number. Please provide from range (0-65535)')
            return
        # Wait for at most 1 second
        # try:
        #     await asyncio.wait_for(eternity(), timeout=1.0)
        # except asyncio.TimeoutError:
        #     print('timeout!')
            
        start_server = websockets.serve(counter, 'localhost', wsport, close_timeout=1000)
        # start_server = websockets.serve(send_message, 'localhost', 6788)
        # start_server2 = websockets.serve(send_message, 'localhost', 6789)
        print('run_until_complete start_server')

        asyncio.get_event_loop().run_until_complete(start_server)
        # asyncio.get_event_loop().run_until_complete(start_server2)
        asyncio.get_event_loop().run_forever()