import { combineReducers } from 'redux';
import video, { initialState as videoState } from './video';
import discussion, { initialState as discussionState, organiseDiscussionEntities } from './discussion';
import notification, { initialState as notificationState } from './notification';

/**
 * Creates the initial state from the props parsed in from JSON.
 *
 * Note that discussion is slightly different in the sense that it makes use of ImmutableJS maps to store the
 * topics, posts, and pending posts id-to-object maps, so that they can be managed, searched and merged more
 * explicitly and
 * efficiently.
 *
 * The rest are simply JS objects to make manipulation code terse elsewhere.
 * @param props The props parsed from JSON
 * @returns {{video: *, discussion: *, notification: *}} The initial store state
 */
export function createInitialState(props) {
  return {
    video: Object.assign({}, videoState, props.video),
    discussion: Object.assign({}, discussionState, organiseDiscussionEntities(props.discussion)),
    notification: Object.assign({}, notificationState, props.notification),
  };
}

export default combineReducers({
  video,
  discussion,
  notification,
});
