import { useState } from 'react';

import { Menu as MUIMenu, PopoverOrigin } from '@mui/material';

type MenuProps<T> = {
  options: T[];
  renderOption(option: T): React.ReactNode;
  renderButton(options: { open: boolean; onClick: (event: React.MouseEvent<HTMLButtonElement>) => void }): void;
  anchorOrigin?: PopoverOrigin;
  transformOrigin?: PopoverOrigin;
};

export const Menu = <T,>({ options, renderOption, renderButton, ...props }: MenuProps<T>) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      {renderButton({ open, onClick: handleClick })}

      <MUIMenu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        {...props}
      >
        {options.map((option) => renderOption(option))}
      </MUIMenu>
    </>
  );
};
