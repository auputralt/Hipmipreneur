"use client";

import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { ChatContainer } from "../../../../components/chat/ChatContainer";
import { useWorkspace } from "../../../../context/WorkspaceContext";
import type { StartupPath } from "../../../../lib/types";

export default function ChatPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const workspaceId = params.workspaceId as string;
  const { activeWorkspace } = useWorkspace();

  const [path, setPath] = useState<StartupPath>("develop");

  useEffect(() => {
    // Priority 1: URL query param
    const queryPath = searchParams.get("path");
    if (queryPath && ["find", "develop", "grow"].includes(queryPath)) {
      setPath(queryPath as StartupPath);
      return;
    }

    // Priority 2: Workspace type mapping
    if (activeWorkspace?.type) {
      const typeMap: Record<string, StartupPath> = {
        "Find my idea": "find",
        "Develop my idea": "develop",
        "Grow my business": "grow",
      };
      const mapped = typeMap[activeWorkspace.type];
      if (mapped) {
        setPath(mapped);
      }
    }
  }, [searchParams, activeWorkspace]);

  return (
    <div className="h-full">
      <ChatContainer workspaceId={workspaceId} path={path} />
    </div>
  );
}
