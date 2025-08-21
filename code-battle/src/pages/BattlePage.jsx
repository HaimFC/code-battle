// Live coding battle view (real-time updates).
import { Title } from '@mantine/core';
import CodeEditor from "../components/CodeEditor";
import ProfileImage from "../components/ProfileImage";

function BattlePage({mode, players, question, }){

    return (
        <>
            <div className="player1">
                <Title size={16}>{players[0].name}</Title>
                <Title size={12}>{players[0].status}</Title>
                <ProfileImage name = {players[0].name} color = "red"/>
            </div>
            <div className="player2">
                <Title size={16}>{players[1].name}</Title>
                <Title size={12}>{players[1].status}</Title>
                <ProfileImage name = {players[0].name} color = "blue"/>
            </div>
            <div className="question">
                <div className="code">
                    <Title size={10}>Code Editor</Title>
                    <CodeEditor/>
                    <Button fullWidth>Run Tests</Button>;
                    
                </div>
            </div>
         </>
  );
}

export default ProfileImage;