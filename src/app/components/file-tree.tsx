'use client';

import {
  Folder,
  File,
  Home,
  Settings,
  Palette,
  LayoutTemplate,
} from 'lucide-react';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

const fileTree = {
  'src': {
    'app': {
      'components': {
        'header.tsx': <File />,
        'main-interface.tsx': <File />,
        'file-tree.tsx': <File />,
        'logo.tsx': <File />,
      },
      'globals.css': <Palette />,
      'layout.tsx': <LayoutTemplate />,
      'page.tsx': <Home />,
    },
    'lib': {
      'utils.ts': <File />,
    },
    'ai': {
      'genkit.ts': <File />,
      'flows': {
        'generate-code-from-vibe.ts': <File />,
      }
    }
  },
  'public': {},
  'package.json': <File />,
  'tailwind.config.ts': <Settings />,
  'next.config.ts': <Settings />,
};

type FileTreeProps = {
  tree?: Record<string, any>;
  level?: number;
};

function FileTreeRecursive({ tree = fileTree, level = 0 }: FileTreeProps) {
  return (
    <>
      {Object.entries(tree).map(([name, content]) => {
        const isFile = typeof content !== 'object' || (content && content.type);

        if (isFile) {
          const Icon = typeof content === 'object' ? content : <File />;
          return (
            <SidebarMenuItem key={name}>
              <SidebarMenuButton
                className="pl-4"
                style={{ paddingLeft: `${1 + level * 1.5}rem` }}
                size="sm"
                tooltip={name}
              >
                {Icon}
                <span>{name}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        }

        return (
          <SidebarMenuItem key={name}>
            <SidebarMenuButton
              className="pl-4"
              style={{ paddingLeft: `${1 + level * 1.5}rem` }}
              size="sm"
            >
              <Folder />
              <span>{name}</span>
            </SidebarMenuButton>
            <SidebarMenu className="pl-4">
              <FileTreeRecursive tree={content} level={level + 1} />
            </SidebarMenu>
          </SidebarMenuItem>
        );
      })}
    </>
  );
}

export function FileTree() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Files</SidebarGroupLabel>
      <SidebarMenu>
        <FileTreeRecursive />
      </SidebarMenu>
    </SidebarGroup>
  );
}
