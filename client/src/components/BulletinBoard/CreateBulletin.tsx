import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../../Root';
import { ThemeProvider, Typography, OutlinedInput, Button} from'@mui/material'
import themeBulletin from './ThemeBulletin'








const CreateBulletin = () => {
    const context = useContext(UserContext)

    const [topic, setTopic] = useState('')
    const [text, setText] = useState('')

    const handleTopic = (e) => {
        setTopic(e.target.value)
    };

    const handleText = (e) => {
      setText(e.target.value)
    }

    const handleBulletinSubmission = (e) => {

    }



    return (
    <div>
    <ThemeProvider theme={themeBulletin}>
        <div id='topic'>
          <OutlinedInput
            style={{ backgroundColor: 'white', marginTop: '30px' }}
            multiline={false}
            rows='1'
            placeholder='enter topic'
            />
        </div>
    </ThemeProvider>
    </div>
  );
};
export default CreateBulletin;
