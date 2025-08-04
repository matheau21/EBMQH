import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

interface PublishContextType {
  hasUnpublishedChanges: boolean;
  markAsChanged: () => void;
  markAsPublished: () => void;
  publishChanges: () => void;
}

const PublishContext = createContext<PublishContextType | undefined>(undefined);

export const usePublish = () => {
  const context = useContext(PublishContext);
  if (context === undefined) {
    throw new Error("usePublish must be used within a PublishProvider");
  }
  return context;
};

interface PublishProviderProps {
  children: ReactNode;
}

export const PublishProvider: React.FC<PublishProviderProps> = ({
  children,
}) => {
  const [hasUnpublishedChanges, setHasUnpublishedChanges] = useState(false);

  const markAsChanged = useCallback(() => {
    setHasUnpublishedChanges(true);
  }, []);

  const markAsPublished = useCallback(() => {
    setHasUnpublishedChanges(false);
  }, []);

  const publishChanges = useCallback(() => {
    // Here we would implement the actual publish logic
    // For now, we'll just simulate publishing by clearing the changes flag
    console.log("Publishing changes...");

    // In a real application, you might:
    // 1. Send data to a server
    // 2. Commit to a database
    // 3. Update a CMS
    // 4. Deploy changes to production

    setHasUnpublishedChanges(false);

    // Show success message
    alert("Changes published successfully!");
  }, []);

  const value = {
    hasUnpublishedChanges,
    markAsChanged,
    markAsPublished,
    publishChanges,
  };

  return (
    <PublishContext.Provider value={value}>{children}</PublishContext.Provider>
  );
};
