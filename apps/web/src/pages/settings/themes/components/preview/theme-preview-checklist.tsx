import { useThemeDetailContext } from '@/contexts/theme-detail-context';
import {
  ChecklistContainer,
  ChecklistDismiss,
  ChecklistDropdown,
  ChecklistItems,
  ChecklistPopper,
  ChecklistPopperContent,
  ChecklistProgress,
  ChecklistRoot,
} from '@usertour-ui/sdk/src/checklist';
import {
  ChecklistCompletionOrder,
  ChecklistData,
  ChecklistInitialDisplay,
} from '@usertour-ui/types';

interface ThemePreviewChecklistProps {
  open?: boolean;
}

export const ThemePreviewChecklist = (props: ThemePreviewChecklistProps) => {
  const { open = true } = props;
  const { theme, settings } = useThemeDetailContext();

  if (!settings) return null;

  const data: ChecklistData = {
    buttonText: 'Checklist',
    initialDisplay: open ? ChecklistInitialDisplay.EXPANDED : ChecklistInitialDisplay.BUTTON,
    completionOrder: ChecklistCompletionOrder.ANY,
    preventDismissChecklist: false,
    items: [
      {
        id: '1',
        name: 'First item',
        description: 'Checklist',
        clickedActions: [],
        completeConditions: [],
        onlyShowTask: false,
        isCompleted: false,
        onlyShowTaskConditions: [],
      },
      {
        id: '2',
        name: 'Second item',
        description: 'Checklist',
        clickedActions: [],
        completeConditions: [],
        onlyShowTask: false,
        isCompleted: false,
        onlyShowTaskConditions: [],
      },
      {
        id: '3',
        name: 'Third item',
        description: 'Checklist',
        clickedActions: [],
        completeConditions: [],
        onlyShowTask: false,
        isCompleted: false,
        onlyShowTaskConditions: [],
      },
    ],
    content: [],
  };

  return (
    <div className="h-full w-full">
      <div className="flex flex-row items-center justify-center h-full scale-100	 ">
        <ChecklistRoot data={data} theme={{ ...theme, settings }}>
          <ChecklistContainer>
            <ChecklistPopper zIndex={1111}>
              <ChecklistPopperContent>
                <ChecklistDropdown />
                <ChecklistProgress width={45} />
                <ChecklistItems />
                <ChecklistDismiss />
              </ChecklistPopperContent>
            </ChecklistPopper>
          </ChecklistContainer>
        </ChecklistRoot>
      </div>
    </div>
  );
};

ThemePreviewChecklist.displayName = 'ThemePreviewChecklist';
