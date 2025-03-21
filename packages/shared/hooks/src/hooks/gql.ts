import { useMutation, useQuery } from '@apollo/client';
import {
  activeUserProject,
  cancelInvite,
  changeTeamMemberRole as changeTeamMemberRoleMutation,
  getAuthConfig,
  getInvite,
  getInvites,
  getTeamMembers,
  inviteTeamMember as inviteTeamMemberMutation,
  listSegment,
  login,
  queryContents,
  removeTeamMember,
  signUp,
} from '@usertour-ui/gql';
import type { Content, ContentDataType, Pagination, Segment, TeamMember } from '@usertour-ui/types';

type UseContentListQueryProps = {
  query: {
    environmentId: string;
    type?: ContentDataType;
  };
  pagination?: Pagination;
  orderBy?: {
    field: string;
    direction: 'asc' | 'desc';
  };
};

export const useContentListQuery = ({
  query,
  orderBy = { field: 'createdAt', direction: 'desc' },
  pagination = { first: 1000 },
}: UseContentListQueryProps) => {
  const { data, refetch, error } = useQuery(queryContents, {
    variables: {
      ...pagination,
      query,
      orderBy,
    },
  });
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const contentList = data?.queryContents?.edges.map((e: any) => e.node);

  const contents = contentList ? (contentList as Content[]) : [];

  return { contents, refetch, error };
};

export const useSegmentListQuery = (
  environmentId: string,
  bizType: string[] = ['COMPANY', 'USER'],
) => {
  const { data, refetch, loading, error } = useQuery(listSegment, {
    variables: { environmentId },
  });
  const segments =
    data?.listSegment?.length > 0
      ? data.listSegment.filter((item: Segment) => bizType.includes(item.bizType))
      : [];

  return { segmentList: segments as Segment[], refetch, loading, error };
};

export const useQueryTeamMemberListQuery = (projectId: string) => {
  const { data, refetch, loading, error } = useQuery(getTeamMembers, {
    variables: { projectId },
  });

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const teamMembers: TeamMember[] =
    data?.getTeamMembers?.map((item: any) => ({
      userId: item.user.id,
      name: item.user.name,
      email: item.user.email,
      role: item.role,
      logo: item.user.logo,
      isInvite: false,
      createdAt: item.createdAt,
    })) ?? [];

  return { teamMembers, refetch, loading, error };
};

export const useQueryInviteListQuery = (projectId: string) => {
  const { data, refetch, loading, error } = useQuery(getInvites, {
    variables: { projectId },
  });

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const invites: TeamMember[] =
    data?.getInvites?.map((item: any) => ({
      inviteId: item.id,
      name: item.name,
      email: item.email,
      role: item.role,
      isInvite: true,
      createdAt: item.createdAt,
    })) ?? [];

  return { invites, refetch, loading, error };
};

export const useInviteTeamMemberMutation = () => {
  const [inviteTeamMember, { loading, error }] = useMutation(inviteTeamMemberMutation);
  const invoke = async (
    projectId: string,
    name: string,
    email: string,
    role: string,
  ): Promise<boolean> => {
    const response = await inviteTeamMember({
      variables: { projectId, name, email, role },
    });
    return !!response.data?.inviteTeamMember;
  };

  return { invoke, loading, error };
};

export const useCancelInviteMutation = () => {
  const [mutation, { loading, error }] = useMutation(cancelInvite);
  const invoke = async (projectId: string, inviteId: string): Promise<boolean> => {
    const response = await mutation({ variables: { projectId, inviteId } });
    return !!response.data?.cancelInvite;
  };

  return { invoke, loading, error };
};

export const useRemoveTeamMemberMutation = () => {
  const [mutation, { loading, error }] = useMutation(removeTeamMember);
  const invoke = async (projectId: string, userId: string): Promise<boolean> => {
    const response = await mutation({ variables: { projectId, userId } });
    return !!response.data?.removeTeamMember;
  };

  return { invoke, loading, error };
};

export const useChangeTeamMemberRoleMutation = () => {
  const [mutation, { loading, error }] = useMutation(changeTeamMemberRoleMutation);
  const invoke = async (projectId: string, userId: string, role: string): Promise<boolean> => {
    const response = await mutation({ variables: { projectId, userId, role } });
    return !!response.data?.changeTeamMemberRole;
  };

  return { invoke, loading, error };
};

export const useGetInviteQuery = (inviteId: string) => {
  const { data, loading, error } = useQuery(getInvite, {
    variables: { inviteId },
  });
  return { data: data?.getInvite, loading, error };
};

export const useGetAuthConfigQuery = () => {
  const { data, loading, error } = useQuery(getAuthConfig);
  return { data: data?.getAuthConfig, loading, error };
};

export type LoginMutationVariables = {
  email: string;
  password: string;
  inviteCode?: string;
};

export const useLoginMutation = () => {
  const [mutation, { loading, error }] = useMutation(login);
  const invoke = async (variables: LoginMutationVariables) => {
    const response = await mutation({ variables });
    return response.data?.login;
  };
  return { invoke, loading, error };
};

export type SignupMutationVariables = {
  code: string;
  password: string;
  userName: string;
  companyName?: string;
  isInvite: boolean;
};

export const useSignupMutation = () => {
  const [mutation, { loading, error }] = useMutation(signUp);
  const invoke = async (variables: SignupMutationVariables) => {
    const response = await mutation({ variables });
    return response.data?.signup;
  };
  return { invoke, loading, error };
};

export const useActiveUserProjectMutation = () => {
  const [mutation, { loading, error }] = useMutation(activeUserProject);
  const invoke = async (userId: string, projectId: string): Promise<boolean> => {
    const response = await mutation({ variables: { userId, projectId } });
    return !!response.data?.activeUserProject;
  };
  return { invoke, loading, error };
};
