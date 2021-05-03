
import { APIWrapper, API_EVENT_TYPE } from "./api.js";
import {
  addMessage,
  animateGift,
  isPossiblyAnimatingGift,
} from "./dom_updates.js";

const order = {
  [API_EVENT_TYPE.ANIMATED_GIFT]: 1,
  [API_EVENT_TYPE.MESSAGE]: 2,
  [API_EVENT_TYPE.GIFT]: 3,
};

let eventQueue = [];

let animationQueue = [];
``;

const orderAllEvents = true;

const api = new APIWrapper(10, false, true);

api.setEventHandler((events) => {
  let orderedEvents;
  if (orderAllEvents) {
    orderedEvents = orderEvents([...eventQueue, ...events]);
  } else {
    orderedEvents = orderEvents(events);
  }

  const uniqueEvents = removeDuplicateEvents([...eventQueue, ...orderedEvents]);

  eventQueue = [...uniqueEvents];
});

function startShowingEvents() {
  setInterval(() => {
    if (eventQueue.length === 0) return;
    else {
      const validEvent = findValidEvent();
      if (validEvent !== undefined && validEvent !== null) {
        showEvent(validEvent);
      }
    }
  }, 1000);
}

function findValidEvent() {
  if (animationQueue.length > 0 && !isPossiblyAnimatingGift()) {
    return animationQueue.shift();
  }

  else if (eventQueue.length === 0) return null;
  else {
    const currentEvent = eventQueue.shift();

    if (currentEvent.type === API_EVENT_TYPE.ANIMATED_GIFT) {
      if (isPossiblyAnimatingGift()) {
        animationQueue = [...animationQueue, currentEvent];
        findValidEvent();
      } else return currentEvent;
    }

    else if (
      currentEvent.type === API_EVENT_TYPE.GIFT ||
      (currentEvent.type === API_EVENT_TYPE.MESSAGE &&
        Date.now() - currentEvent.timestamp.getTime() < 20000)
    ) {
      return currentEvent;
    } else findValidEvent();
  }
}

function orderEvents(events) {
  return events.sort(compareEvents);
}

function compareEvents(a, b) {
  return order[a.type] - order[b.type];
}

function removeDuplicateEvents(events) {
  return events.filter(
    (event, index, self) =>
      self.findIndex((_event) => _event.id === event.id) === index,
  );
}

function showEvent(event) {
  switch (event.type) {
    case API_EVENT_TYPE.ANIMATED_GIFT:
      animateGift(event);
      addMessage(event);
      break;
    default:
      addMessage(event);
      break;
  }
}

startShowingEvents();

// NOTE: UI helper methods from `dom_updates` are already imported above.
