/* Promise-based confirm dialog that replaces window.confirm():
     const confirm = useConfirm();
     if (!(await confirm({ title: 'Delete recipe?', confirmLabel: 'Delete', danger: true }))) return;
   Pass `requireText: 'DELETE'` to make the user type a word first. */
import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Button, Input, Modal } from './ui';

const ConfirmContext = createContext(null);

export const ConfirmProvider = ({ children }) => {
  const [options, setOptions] = useState(null);
  const [typed, setTyped] = useState('');
  const resolver = useRef(null);

  const confirm = useCallback((opts) => {
    setTyped('');
    setOptions(opts);
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const close = (result) => {
    resolver.current?.(result);
    resolver.current = null;
    setOptions(null);
  };

  const needsText = Boolean(options?.requireText);
  const canConfirm = !needsText || typed === options.requireText;

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal
        open={Boolean(options)}
        onClose={() => close(false)}
        title={options?.title}
        description={options?.description}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => close(false)}>
              {options?.cancelLabel || 'Cancel'}
            </Button>
            <Button
              variant={options?.danger ? 'danger' : 'primary'}
              disabled={!canConfirm}
              onClick={() => close(true)}
              data-autofocus={needsText ? undefined : true}
            >
              {options?.confirmLabel || 'Confirm'}
            </Button>
          </>
        }
      >
        {needsText && (
          <div className="space-y-1.5">
            <label htmlFor="confirm-text" className="text-[13px] text-ink-2">
              Type <span className="font-semibold text-ink">{options.requireText}</span> to confirm
            </label>
            <Input
              id="confirm-text"
              data-autofocus
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoComplete="off"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && canConfirm) close(true);
              }}
            />
          </div>
        )}
      </Modal>
    </ConfirmContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useConfirm = () => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used inside ConfirmProvider');
  return ctx;
};
