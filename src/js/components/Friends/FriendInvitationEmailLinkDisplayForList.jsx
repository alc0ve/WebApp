import { Button } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import React, { Component, Suspense } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import FriendActions from '../../actions/FriendActions';
import VoterStore from '../../stores/VoterStore';
import { Avatar } from '../Style/avatarStyles';
import { isWebApp } from '../../common/utils/isCordovaOrWebApp';
import { renderLog } from '../../common/utils/logging';

const ImageHandler = React.lazy(() => import(/* webpackChunkName: 'ImageHandler' */ '../ImageHandler'));

class FriendInvitationEmailLinkDisplayForList extends Component {
  constructor (props) {
    super(props);
    this.state = {
      cancelFriendInviteEmailSubmitted: false,
      voter: {},
    };
    this.cancelFriendInviteEmail = this.cancelFriendInviteEmail.bind(this);
  }

  componentDidMount () {
    this.onVoterStoreChange();
    this.voterStoreListener = VoterStore.addListener(this.onVoterStoreChange.bind(this));
  }

  componentWillUnmount () {
    this.voterStoreListener.remove();
  }

  onVoterStoreChange () {
    this.setState({ voter: VoterStore.getVoter() });
  }

  cancelFriendInviteEmail (voterEmailAddress) {
    // console.log("cancelFriendInviteEmail");
    FriendActions.cancelFriendInviteEmail(voterEmailAddress);
    this.setState({
      cancelFriendInviteEmailSubmitted: true,
    });
  }

  render () {
    renderLog('FriendInvitationEmailLinkDisplayForList');  // Set LOG_RENDER_EVENTS to log all renders
    const {
      classes,
      invitationState,
      linkedOrganizationWeVoteId,
      mutualFriends,
      positionsTaken,
      previewMode,
      voterTwitterHandle,
      voterEmailAddress,
      voterPhotoUrlLarge,
    } = this.props;

    const { cancelFriendInviteEmailSubmitted, voter } = this.state;
    let invitationStateText;
    if (invitationState === 'PENDING_EMAIL_VERIFICATION') {
      invitationStateText = 'Your invitation will be sent when you verify your email address.';
    } else if (invitationState === 'NO_RESPONSE') {
      invitationStateText = '';
    }

    // Link to their voter guide
    const twitterVoterGuideLink = voterTwitterHandle ? `/${voterTwitterHandle}` : null;
    const weVoteIdVoterGuideLink = linkedOrganizationWeVoteId ? `/voterguide/${linkedOrganizationWeVoteId}` : null;
    const voterGuideLink = twitterVoterGuideLink || weVoteIdVoterGuideLink;
    const voterImage = <ImageHandler sizeClassName="icon-lg " imageUrl={voterPhotoUrlLarge} kind_of_ballot_item="CANDIDATE" />;
    const voterDisplayNameFormatted = <span className="card-child__display-name">{voterEmailAddress}</span>;
    const detailsHTML = (
      <Details>
        <Name>
          {voterDisplayNameFormatted}
        </Name>
        {!!(positionsTaken) && (
          <Info>
            Opinions:
            {' '}
            <strong>{positionsTaken}</strong>
          </Info>
        )}
        {!!(mutualFriends) && (
          <Info>
            Mutual Friends:
            {' '}
            <strong>{mutualFriends || 0}</strong>
          </Info>
        )}
        { invitationStateText ? <p>{invitationStateText}</p> : null }
      </Details>
    );

    const friendInvitationHtml = (
      <Wrapper previewMode={previewMode}>
        <Flex>
          <Avatar>
            { voterGuideLink ? (
              <Link to={voterGuideLink} className="u-no-underline">
                <Suspense fallback={<></>}>
                  {voterImage}
                </Suspense>
              </Link>
            ) : (
              <>
                <Suspense fallback={<></>}>
                  {voterImage}
                </Suspense>
              </>
            )}
          </Avatar>
          { voterGuideLink ? (
            <Link to={voterGuideLink} className="u-no-underline">
              {detailsHTML}
            </Link>
          ) : (
            <>
              {detailsHTML}
            </>
          )}
        </Flex>
        <ButtonWrapper>
          {invitationState === 'PENDING_EMAIL_VERIFICATION' && !voter.signed_in_with_email ? (
            <Link to="/settings/account">
              <ButtonContainer>
                <Button variant="outlined" color="primary">
                  Verify Your Email
                </Button>
              </ButtonContainer>
            </Link>
          ) : null}
          <CancelButtonContainer>
            <Button
              classes={{ root: classes.ignoreButton }}
              color="primary"
              disabled={cancelFriendInviteEmailSubmitted}
              fullWidth
              onClick={() => this.cancelFriendInviteEmail(voterEmailAddress)}
              variant="outlined"
            >
              {cancelFriendInviteEmailSubmitted ? 'Canceling...' : 'Cancel Invite'}
            </Button>
          </CancelButtonContainer>
        </ButtonWrapper>
      </Wrapper>
    );

    if (previewMode) {
      return <span>{friendInvitationHtml}</span>;
    } else {
      return (
        <div>
          {friendInvitationHtml}
        </div>
      );
    }
  }
}
FriendInvitationEmailLinkDisplayForList.propTypes = {
  classes: PropTypes.object,
  invitationState: PropTypes.string, // Comes friend data object from API server
  linkedOrganizationWeVoteId: PropTypes.string,
  mutualFriends: PropTypes.number,
  positionsTaken: PropTypes.number,
  previewMode: PropTypes.bool,
  voterEmailAddress: PropTypes.string,
  voterPhotoUrlLarge: PropTypes.string,
  voterTwitterHandle: PropTypes.string,
};

const styles = () => ({
  ignoreButton: {
    // fontSize: '12.5px',
  },
});

const Wrapper = isWebApp() ? styled.div`
  margin: 24px 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  position: relative;
  flex-wrap: wrap;
  @media(min-width: 400px) {
    align-items: center;
    justify-content: flex-start;
    flex-direction: row;
    padding-left: 100px;
  }
  @media (min-width: 520px) {
    height: 68px;
    padding-left: 85px;
  }
` : styled.div`
  margin: 24px 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  position: relative;
  flex-wrap: wrap;
`;

const Flex = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: flex-start;
`;

const Details = isWebApp() ? styled.div`
  margin: 0 auto;
  @media(min-width: 400px) {
    width: fit-content;
    margin: 0;
  }
` : styled.div`
  margin: 0 auto;
`;

const Name = styled.h3`
  color: black !important;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 4px;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 23ch;
  width: 100%;
  @media(max-width: 321px) {
    max-width: 20ch;
  }
  @media (min-width: 322px) and (max-width: 370px) {
    max-width: 20ch;
  }
  @media (min-width: 371px) and (max-width: 441px) {
    max-width: 20ch;
  }
  @media (min-width: 442px) and (max-width: 519px) {
    max-width: 12ch;
  }
  @media (min-width: 520px) and (max-width: 559px) {
    max-width: 15ch;
  }
  @media (min-width: 560px) and (max-width: 653px) {
    max-width: 20ch;
  }
  @media (min-width: 654px) and (max-width: 773px) {
    max-width: 25ch;
  }
  @media (min-width: 774px) and (max-width: 991px) {
    max-width: 34ch;
  }
  @media(min-width: 400px) {
    text-align: left;
    font-size: 22px;
    width: fit-content;
  }
`;

const Info = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  @media (min-width: 400px){
    display: block;
    width: fit-content;
  }
`;

const ButtonWrapper = isWebApp() ? styled.div`
  width: 100%;
  margin: 12px 0 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  @media(min-width: 400px) {
    margin: 0;
    margin-left: auto;
    width: fit-content;
    align-items: flex-end;
    flex-direction: column;
    justify-content: flex-end;
  }
  @media (min-width: 520px) {
    flex-direction: row-reverse;
    justify-content: flex-end;
    align-items: center;
  }
` : styled.div`
  width: 100%;
  margin: 12px 0 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ButtonContainer = styled.div`
  width: 100%;
  margin-left: 12px;
  @media(min-width: 400px) {
    width: fit-content;
    margin: 0;
    margin-top: 6px;
  }
  @media(min-width: 520px) {
    margin: 0;
    margin-right: 8px;
  }
`;

const CancelButtonContainer = styled.div`
  width: 100%;
  margin-left: 12px;
  @media(min-width: 520px) {
    margin: 0;
    margin-left: 8px;
  }
`;

export default withStyles(styles)(FriendInvitationEmailLinkDisplayForList);
