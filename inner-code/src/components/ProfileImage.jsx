// Editor where users write and run code (used in Practice & Battle)
import { Avatar } from '@mantine/core';

function ProfileImage({name, color}){

    return (
         <Avatar key={name} name={name} color={color}/>
  );
}

export default ProfileImage;