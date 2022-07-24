import classNames from 'classnames';

import styles from './userAvatar.module.css';

const UserAvatar = ({ className, imageUrl }: PropsInterface) => (
  <img
    className={classNames(className, styles.userThumbnail)}
    src={imageUrl}
    alt=''
  />
);

interface PropsInterface {
  className: string;
  imageUrl: string;
}

export default UserAvatar;
