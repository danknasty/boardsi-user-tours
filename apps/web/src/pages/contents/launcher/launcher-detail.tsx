import { useAppContext } from '@/contexts/app-context';
import { ContentDetailProvider } from '@/contexts/content-detail-context';
import { ContentListProvider } from '@/contexts/content-list-context';
import { ContentVersionProvider } from '@/contexts/content-version-context';
import { ContentVersionListProvider } from '@/contexts/content-version-list-context';
import { SegmentListProvider } from '@/contexts/segment-list-context';
import { ThemeListProvider } from '@/contexts/theme-list-context';
import { ContentTypeName } from '@usertour-ui/types';
import { ContentDetailContent } from '../components/detail/content-detail-content';
import { ContentDetailHeader } from '../components/detail/content-detail-header';
import { ContentDetailSettings } from '../components/detail/content-detail-settings';
import { ContentDetailAnalytics } from '../components/version/content-detail-analytics';
import { ContentDetailVersion } from '../components/version/content-detail-version';
import { ContentLocalizationList } from '../components/version/content-localization-list';

export const LauncherDetailContent = () => {
  const { project } = useAppContext();

  return (
    <ThemeListProvider projectId={project?.id}>
      <div className="p-14 mt-12 ">
        <div className="flex flex-row space-x-8 justify-center max-w-screen-xl mx-auto">
          <ContentDetailSettings />
          <ContentDetailContent />
        </div>
      </div>
    </ThemeListProvider>
  );
};

LauncherDetailContent.displayName = 'LauncherDetailContent';

interface LauncherDetailProps {
  contentId: string;
  type: string;
}
export const LauncherDetail = (props: LauncherDetailProps) => {
  const { contentId, type } = props;
  const { environment } = useAppContext();

  return (
    <SegmentListProvider environmentId={environment?.id} bizType={['COMPANY', 'USER']}>
      <ContentListProvider
        environmentId={environment?.id}
        key={'environmentId'}
        contentType={ContentTypeName.LAUNCHERS}
        defaultPagination={{ pageSize: 100, pageIndex: 0 }}
      >
        <ContentDetailProvider contentId={contentId} contentType={ContentTypeName.LAUNCHERS}>
          <ContentVersionProvider>
            <ContentVersionListProvider contentId={contentId}>
              <ContentDetailHeader />
              {type === 'detail' && <LauncherDetailContent />}
              {type === 'versions' && <ContentDetailVersion />}
              {type === 'analytics' && <ContentDetailAnalytics contentId={contentId} />}
              {type === 'localization' && <ContentLocalizationList />}
            </ContentVersionListProvider>
          </ContentVersionProvider>
        </ContentDetailProvider>
      </ContentListProvider>
    </SegmentListProvider>
  );
};

LauncherDetail.displayName = 'LauncherDetail';
