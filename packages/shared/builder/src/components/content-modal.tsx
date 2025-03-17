import { useLazyQuery } from '@apollo/client';
import { EXTENSION_CONTENT_MODAL } from '@usertour-ui/constants';
import { queryOembedInfo } from '@usertour-ui/gql';
import {
  Popper,
  PopperClose,
  PopperContent,
  PopperModalContentPotal,
  PopperProgress,
} from '@usertour-ui/sdk';
import {
  ContentEditor,
  ContentEditorElementType,
  ContentEditorRoot,
} from '@usertour-ui/shared-editor';
import { convertSettings, convertToCssVars, loadGoogleFontCss } from '@usertour-ui/shared-utils';
import {
  Attribute,
  Content,
  ContentDataType,
  ContentOmbedInfo,
  ContentVersion,
  Step,
  Theme,
  ThemeTypesSetting,
} from '@usertour-ui/types';
import { forwardRef, useEffect, useState } from 'react';
import { useAws } from '../hooks/use-aws';

export interface ContentModalProps {
  currentStep: Step;
  theme: Theme | undefined;
  attributeList: Attribute[] | undefined;
  currentVersion: ContentVersion | undefined;
  zIndex: number;
  currentIndex: number;
  onChange: (value: ContentEditorRoot[]) => void;
  contents: Content[];
  currentContent: Content | undefined;
  createStep: (currentVersion: ContentVersion, sequence: number) => Promise<Step | undefined>;
}

export const ContentModal = forwardRef<HTMLDivElement, ContentModalProps>(
  (props: ContentModalProps, ref) => {
    const {
      currentStep,
      theme,
      attributeList,
      currentVersion,
      zIndex,
      onChange,
      contents,
      currentIndex,
      currentContent,
      createStep,
    } = props;
    const [globalStyle, setGlobalStyle] = useState<string>('');
    const [themeSetting, setThemeSetting] = useState<ThemeTypesSetting>();
    const [data, setData] = useState<any>(currentStep.data);
    const { upload } = useAws();
    const [queryOembed] = useLazyQuery(queryOembedInfo);
    const contentType = currentContent?.type as ContentDataType;

    useEffect(() => {
      if (theme) {
        setThemeSetting(theme.settings);
        setGlobalStyle(convertToCssVars(convertSettings(theme.settings)));
      }
    }, [theme]);

    const handleEditorValueChange = (value: any) => {
      setData(value);
      onChange(value);
    };

    const handleCustomUploadRequest = (file: File): Promise<string> => {
      return upload(file);
    };

    const getOembedInfo = async (url: string): Promise<ContentOmbedInfo> => {
      const resp = { html: '', width: 0, height: 0 };
      const ret = await queryOembed({ variables: { url } });
      if (ret?.data?.queryOembedInfo) {
        return ret?.data?.queryOembedInfo;
      }
      return resp;
    };

    useEffect(() => {
      if (themeSetting?.font?.fontFamily) {
        loadGoogleFontCss(themeSetting.font.fontFamily, document);
      }
    }, [themeSetting]);

    const progress = Math.min(
      currentVersion?.steps?.length ? (currentIndex + 1 / currentVersion?.steps?.length) * 100 : 0,
      100,
    );
    const enabledElementTypes =
      contentType === ContentDataType.SURVEY || contentType === ContentDataType.NPS
        ? Object.values(ContentEditorElementType)
        : undefined;

    return (
      <>
        <div id="usertour-widget">
          <Popper triggerRef={undefined} open={true} zIndex={zIndex} globalStyle={globalStyle}>
            <PopperModalContentPotal
              position={currentStep.setting.position}
              positionOffsetX={currentStep.setting.positionOffsetX}
              positionOffsetY={currentStep.setting.positionOffsetY}
              enabledBackdrop={currentStep.setting.enabledBackdrop}
              width={`${currentStep.setting.width}px`}
              ref={ref}
            >
              <PopperContent>
                {currentStep.setting.skippable && <PopperClose />}
                <ContentEditor
                  zIndex={zIndex + EXTENSION_CONTENT_MODAL}
                  enabledElementTypes={enabledElementTypes}
                  customUploadRequest={handleCustomUploadRequest}
                  initialValue={data}
                  attributes={attributeList}
                  contentList={contents}
                  currentVersion={currentVersion}
                  currentStep={currentStep}
                  onValueChange={handleEditorValueChange}
                  getOembedInfo={getOembedInfo}
                  createStep={createStep}
                />

                <PopperProgress width={progress} />
              </PopperContent>
            </PopperModalContentPotal>
          </Popper>
        </div>
      </>
    );
  },
);
ContentModal.displayName = 'ContentModal';
