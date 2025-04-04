-- Create a friend_requests table
CREATE TABLE friend_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "senderId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "receiverId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'accepted', 'rejected')),
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "respondedAt" TIMESTAMP,
  UNIQUE("senderId", "receiverId")
);

-- Create a friends junction table
CREATE TABLE friends (
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "friendId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY ("userId", "friendId")
);

-- Create an index for reverse lookups
CREATE INDEX idx_friends_friendId ON friends("friendId");