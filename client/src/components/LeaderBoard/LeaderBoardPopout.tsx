import React, { useContext } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import { makeStyles } from '@material-ui/core';
import CloseIcon from '@mui/icons-material/Close';
import { UserContext } from '../../Root';

const contentStyles = makeStyles((theme) => ({
  dialogContent: {
    backgroundColor: 'rgb(133, 211, 255)', // Customize the background color
    color: 'black', // Customize the text color
    padding: theme.spacing(2), // Customize the padding
  },
}));

const LeaderBoardPopout = ({
  children,
  openLeaderBoard,
  setOpenLeaderBoard,
  setLeaderBoard,
}) => {
  const classes = contentStyles();
  const { isDark } = useContext(UserContext);

  const handleClose = () => {
    setOpenLeaderBoard(false);
    setLeaderBoard(false);
  };
  return (
    <Dialog
      open={openLeaderBoard}
      onClose={() => setOpenLeaderBoard(false)}
      sx={{
        '& .MuiPaper-root': {
          backgroundColor: isDark ? '#707070' : '#ececec',
          margin: '20px',
        },
      }}
    >
      {children}
    </Dialog>
  );
};

export default LeaderBoardPopout;
