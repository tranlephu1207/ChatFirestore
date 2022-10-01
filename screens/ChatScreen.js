import {Bubble, GiftedChat, InputToolbar} from 'react-native-gifted-chat'
import {
  FlatList,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';

import Icon from 'react-native-vector-icons/Ionicons'
import { NavigationContainer } from '@react-navigation/native';
import { ScrollView } from 'react-native-virtualized-view';
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import firestore from '@react-native-firebase/firestore'

Icon.loadFont().then();



const ChatScreen = ({user, route}) => {
  const [messages, setMessages] = useState([]);
  const {uid} = route.params;
  // const mainuser = user[0]

  console.log(uid, user.uid);

  // const getAllMessages = async () => {
  //   const docid = uid > user.uid ? user.uid+"-"+uid : uid+"-"+user.uid   
  //   const msgResponse = await firestore().collection('Chats')
  //   .doc(docid)
  //   .collection('messages')
  //   .orderBy('createdAt', "desc")
  //   .get()
  //   const allTheMsgs = msgResponse.docs.map(docSanp => {
  //     return {
  //       ...docSanp.data(),
  //       createdAt:docSanp.data().createdAt.toDate()
  //     }
  //   })
  //   setMessages(allTheMsgs)
  // }
  
  // useEffect(() => {
  //   getAllMessages()
  // },[]);

  useEffect(() => {
    const docid = uid > user.uid ? user.uid+"-"+uid : uid+"-"+user.uid   
    // const msgResponse = await firestore().collection('Chats')
    // .doc(docid)
    // .collection('messages')
    // .orderBy('createdAt', "desc")
    const subscriber = firestore()
      .collection('Chats')
      .doc(docid)
      .collection('messages')
      .orderBy('createdAt', "desc")
      .onSnapshot(documentSnapshot => {
        // console.log('User data: ', documentSnapshot.docs);
        const allTheMsgs = [];
        for (const docSanp of documentSnapshot.docs) {
          const data = docSanp.data();
          // console.log('docSanp', data);
          // console.log(`createdAt ${user.uid}`, data.createdAt);
          if (data.createdAt !== null) {
            allTheMsgs.push({
              ...data,
              createdAt: data.createdAt.toDate()
            });
          }
        }
        // const allTheMsgs = documentSnapshot.docs.map(docSanp => {
        //   const data = docSanp.data();
        //   console.log('docSanp', data);
        //   console.log(`createdAt ${user.uid}`, data.createdAt);
        //   console.log(`createdAtDate ${user.uid}`, data.createdAt.toDate());
        //   if (!data.createdAt) {
        //     console.log(`NULL createdAt ${user.uid}`, data);
        //   }
        //   return {
        //     ...data,
        //     createdAt: data.createdAt.toDate()
        //     // createdAt: data.createdAt
        //   }
        // })
        setMessages(allTheMsgs)
      });

    // Stop listening for updates when no longer required
    return () => subscriber();
  }, [user.uid]);

  const onSend = (msgArray) => {
    const msg = msgArray[0]
    const usermsg = {
      ...msg,
      sentBy: user.uid,
      sentTo: uid,
      createdAt: new Date()
    }
    console.log(usermsg.sentBy, usermsg.sentTo, usermsg.createdAt )

    setMessages(previousMessages => GiftedChat.append(previousMessages, usermsg))
    const docid = uid > user.uid ? user.uid+ "-" +uid : uid+ "-" +user.uid
    
    firestore().collection('Chats')
    .doc(docid)
    .collection('messages')
    .add({...usermsg, createdAt:firestore.FieldValue.serverTimestamp()})
  }


  return (
     <GiftedChat 
          style={{flex: 1}}
          messages={messages}
          onSend={text => onSend(text)}
          user={{ 
            _id: user.uid,
          }}
          renderBubble={(props)=>{
              return <Bubble
              {...props}
              wrapperStyle={{
                right: {
                  backgroundColor:"#009387",

                }
                
              }}
            />
          }}
        renderInputToolbar={(props)=>{
            return <InputToolbar {...props}
              containerStyle={{borderTopWidth: 1.5, borderTopColor: '#009387'}} 
              textInputStyle={{ color: "black" }}
              />
        }}
      />
  );
};

const styles = StyleSheet.create({
    Contain: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
  Container: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    height: 'auto',
    marginHorizontal: 4,
    marginVertical: 6,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  imageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  userImage: {
    paddingTop: 15,
    paddingBottom: 15,
  },
  userImageST: {
    width: 50,
    height: 50,
    borderRadius: 25,
  }, 
  textArea: {
    flexDirection: 'column',
    justifyContent: 'center',
    padding: 5,
    paddingLeft: 10,
    width: 300,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
  },
  userText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nameText: {
    fontSize: 14,
    fontWeight: '900',
    fontFamily: 'Verdana'
  },
  msgTime: {
    textAlign: 'right',
    fontSize: 11,
    marginTop: -20,
  },
  msgContent: {
    paddingTop: 5,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default ChatScreen;
