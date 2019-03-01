import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactSVG from 'react-svg';
import { cordovaDot } from '../../utils/cordovaUtils';
import IssueStore from '../../stores/IssueStore';
import { renderLog } from '../../utils/logging';
import VoterGuideStore from '../../stores/VoterGuideStore';

// Show a voter a horizontal list of all of the issues they are following that relate to this ballot item
export default class IssuesByBallotItemDisplayList extends Component {
  static propTypes = {
    ballotItemWeVoteId: PropTypes.string.isRequired,
  };

  constructor (props) {
    super(props);
    this.state = {
      issuesUnderThisBallotItemVoterIsFollowing: [],
      issuesUnderThisBallotItemVoterIsNotFollowing: [],
      maximumNumberOfIssuesToDisplay: 26,
    };
  }

  componentDidMount () {
    this.issueStoreListener = IssueStore.addListener(this.onIssueStoreChange.bind(this));
    this.voterGuideStoreListener = VoterGuideStore.addListener(
      this.onVoterGuideStoreChange.bind(this),
    );
    this.onVoterGuideStoreChange();
    this.setState({
      ballotItemWeVoteId: this.props.ballotItemWeVoteId,
      issuesUnderThisBallotItemVoterIsFollowing: IssueStore.getIssuesUnderThisBallotItemVoterIsFollowing(this.props.ballotItemWeVoteId),
      issuesUnderThisBallotItemVoterIsNotFollowing: IssueStore.getIssuesUnderThisBallotItemVoterNotFollowing(this.props.ballotItemWeVoteId),
    });
  }

  componentWillReceiveProps (nextProps) {
    this.setState({
      ballotItemWeVoteId: nextProps.ballotItemWeVoteId,
      issuesUnderThisBallotItemVoterIsFollowing: IssueStore.getIssuesUnderThisBallotItemVoterIsFollowing(nextProps.ballotItemWeVoteId),
      issuesUnderThisBallotItemVoterIsNotFollowing: IssueStore.getIssuesUnderThisBallotItemVoterNotFollowing(nextProps.ballotItemWeVoteId),
    });
  }

  componentWillUnmount () {
    this.issueStoreListener.remove();
    this.voterGuideStoreListener.remove();
  }

  onIssueStoreChange () {
    const { ballotItemWeVoteId } = this.state;
    this.setState({
      issuesUnderThisBallotItemVoterIsFollowing: IssueStore.getIssuesUnderThisBallotItemVoterIsFollowing(ballotItemWeVoteId),
      issuesUnderThisBallotItemVoterIsNotFollowing: IssueStore.getIssuesUnderThisBallotItemVoterNotFollowing(ballotItemWeVoteId),
    });
  }

  onVoterGuideStoreChange () {
    // We just want to trigger a re-render
    this.setState();
  }

  render () {
    renderLog(__filename);
    const issuesUnderThisBallotItemVoterIsFollowingFound =
      this.state.issuesUnderThisBallotItemVoterIsFollowing &&
      this.state.issuesUnderThisBallotItemVoterIsFollowing.length;
    const issuesUnderThisBallotItemVoterIsNotFollowingFound =
      this.state.issuesUnderThisBallotItemVoterIsNotFollowing &&
      this.state.issuesUnderThisBallotItemVoterIsNotFollowing.length;

    // console.log('this.state.ballotItemWeVoteId: ', this.state.ballotItemWeVoteId);
    // console.log('this.state.issuesUnderThisBallotItemVoterIsFollowing: ', this.state.issuesUnderThisBallotItemVoterIsFollowing);
    // console.log('this.state.issuesUnderThisBallotItemVoterIsNotFollowing: ', this.state.issuesUnderThisBallotItemVoterIsNotFollowing);
    if (
      !issuesUnderThisBallotItemVoterIsFollowingFound &&
      !issuesUnderThisBallotItemVoterIsNotFollowingFound
    ) {
      return null;
    }

    let localCounter = 0;
    const issuesVoterIsFollowingHtml = this.state.issuesUnderThisBallotItemVoterIsFollowing.map(
      (oneIssue) => {
        if (!oneIssue) {
          return null;
        }
        // console.log('oneIssue.issue_name: ', oneIssue.issue_name);
        localCounter++;
        if (localCounter <= this.state.maximumNumberOfIssuesToDisplay) {
          return (
            <li
              className="u-push--sm issue-icon-list__issue-block"
              key={`issue-icon-${oneIssue.issue_we_vote_id}`}
            >
              {oneIssue.issue_icon_local_path ? (
                <span className="issue-icon-list__issue-icon">
                  <ReactSVG src={cordovaDot(`/img/global/svg-icons/issues/${oneIssue.issue_icon_local_path}.svg`)}
                            svgStyle={{ fill: '#999', padding: '1px 1px 1px 0px' }}
                  />
                </span>
              ) : null
              }
              <div className="u-margin-left--xxs issue-icon-list__issue-label-name">
                {oneIssue.issue_name}
              </div>
            </li>
          );
        } else {
          return null;
        }
      },
    );
    localCounter = 0;
    const issuesVoterIsNotFollowingHtml = this.state.issuesUnderThisBallotItemVoterIsNotFollowing.map(
      (oneIssue) => {
        if (!oneIssue) {
          return null;
        }
        localCounter++;
        if (localCounter <= this.state.maximumNumberOfIssuesToDisplay) {
          return (
            <li
              className="u-push--sm issue-icon-list__issue-block"
              key={`issue-icon-${oneIssue.issue_we_vote_id}`}
            >
              {oneIssue.issue_icon_local_path ? (
                <span className="issue-icon-list__issue-icon">
                  <ReactSVG src={cordovaDot(`/img/global/svg-icons/issues/${oneIssue.issue_icon_local_path}.svg`)}
                            svgStyle={{ fill: '#4B4B4B', padding: '1px 1px 1px 0px' }}
                  />
                </span>
              ) : null
              }
              <div className="u-margin-left--xxs issue-icon-list__issue-label-name">
                {oneIssue.issue_name}
              </div>
            </li>
          );
        } else {
          return null;
        }
      },
    );

    return (
      <div className="issues-list-stacked__support-list u-flex u-justify-between u-items-center">
        <div className="issues-list-stacked__support-list__container-wrap">
          {/* Show a break-down of the current positions in your network */}
          <div className="issues-list-stacked__support-list__container u-flex u-items-start u-inset__v--xs">
            <ul className="issues-list-stacked__support-list__items">
              {/* Issues the voter is already following */}
              {issuesVoterIsFollowingHtml}
              {/* Issues the voter is not following yet */}
              {issuesVoterIsNotFollowingHtml}
            </ul>
          </div>
        </div>
      </div>
    );
  }
}
