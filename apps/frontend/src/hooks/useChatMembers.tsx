import { createContext, FC, PropsWithChildren, useContext } from 'react';

import { Member } from '../data/services/duty-api';

const ChatMembersContext = createContext<Member[] | undefined>(undefined);

type Props = {
  members: Member[];
};

export const ChatMembersProvider: FC<PropsWithChildren<Props>> = ({
  members,
  children,
}) => {
  return (
    <ChatMembersContext.Provider value={members}>
      {children}
    </ChatMembersContext.Provider>
  );
};

export function useChatMembers() {
  const context = useContext(ChatMembersContext);

  if (typeof context === 'undefined') {
    throw Error('ChatMembersContext is undefined');
  }

  return context;
}
