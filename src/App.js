import React from 'react';
import {useEffect, useState, useCallback} from 'react';
import axios from 'axios';

import './App.css';

import List from './Components/List/List';
import Navbar from './Components/Navbar/Navbar';

function App() {
  const priorityList = [{name:'No priority', priority: 0}, {name:'Low', priority: 1}, {name:'Medium', priority: 2}, {name:'High', priority: 3}, {name:'Urgent', priority: 4}]
  const statusList = ['In progress', 'Backlog', 'Todo', 'Done', 'Cancelled']
  const userList = ['Yogesh', 'Anoop sharma', 'Shankar Kumar', 'Suresh', 'Ramesh']

  const [groupValue, setGroupValue] = useState(getStateFromLocalStorage() || 'status')
  const [orderValue, setOrderValue] = useState('title')
  const [ticketDetails, setTicketDetails] = useState([]);


  const orderDataByValue = useCallback(async (cardsArry) => {
    if (orderValue === 'priority') {
      cardsArry.sort((a, b) => b.priority - a.priority);
    } else if (orderValue === 'title') {
      cardsArry.sort((a, b) => {
        const titleA = a.title.toLowerCase();
        const titleB = b.title.toLowerCase();

        if (titleA < titleB) {
          return -1;
        } else if (titleA > titleB) {
          return 1;
        } else {
          return 0;
        }
      });
    }
    await setTicketDetails(cardsArry);
  }, [orderValue, setTicketDetails]);

  function saveToLocalStorage(state) {
    localStorage.setItem('groupValue', JSON.stringify(state));
  }

  function getStateFromLocalStorage() {
    const storedState = localStorage.getItem('groupValue');
    if (storedState) {
      return JSON.parse(storedState);
    }
    return null; 
  }

  function handleOrderValue(value){
    setOrderValue(value);
    console.log(value);
  }
  
  function handleGroupValue(value){
    setGroupValue(value);
    console.log(value);
  }

  useEffect(() => {
    saveToLocalStorage(groupValue);
    async function fetchData() {
      const result = await axios.get('https://api.quicksell.co/v1/internal/frontend-assignment');
      await refactorData(result);
  
    }
    fetchData();
    async function refactorData(result){
      let ticketArray = []
        if(result.status  === 200){
          for(let i=0; i<result.data.tickets.length; i++){
            for(let j=0; j<result.data.users.length; j++){
              if(result.data.tickets[i].userId === result.data.users[j].id){
                let ticketJson = {...result.data.tickets[i], userObj: result.data.users[j]}
                ticketArray.push(ticketJson)
              }
            }
          }
        }
      await setTicketDetails(ticketArray)
      orderDataByValue(ticketArray)
    }
    
  }, [orderDataByValue, groupValue])

  
  return (
    <>
      <Navbar
        groupValue={groupValue}
        orderValue={orderValue}
        handleGroupValue={handleGroupValue}
        handleOrderValue={handleOrderValue}
      />
      <section className="board-details">
        <div className="board-details-list">
          {
            {
              'user' : <>
              {
                userList.map((listItem) => {
                  return(<List
                    groupValue='user'
                    orderValue={orderValue}
                    listTitle={listItem}
                    listIcon=''
                    userList={userList}
                    ticketDetails={ticketDetails}
                  />)
                })
              }
              </>,
              'status' : <>
                {
                  statusList.map((listItem) => {
                    return(<List
                      groupValue='status'
                      orderValue={orderValue}
                      listTitle={listItem}
                      listIcon=''
                      statusList={statusList}
                      ticketDetails={ticketDetails}
                    />)
                  })
                }
              </>,
              'priority' : <>
              {
                priorityList.map((listItem) => {
                  return(<List
                    groupValue='priority'
                    orderValue={orderValue}
                    listTitle={listItem.priority}
                    listIcon=''
                    priorityList={priorityList}
                    ticketDetails={ticketDetails}
                  />)
                })
              }
            </>
            }[groupValue]
          }
        </div>
      </section>
    </>
  );
}

export default App;
