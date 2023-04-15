import { Snackbar } from "@amplication/ui/design-system";
import { gql, useQuery } from "@apollo/client";
import React, { useCallback, useContext } from "react";
import { AppContext } from "../../context/appContext";
import PageContent from "../../Layout/PageContent";
import {
  EnumGitOrganizationType,
  EnumResourceType,
  Resource,
} from "../../models";
import { formatError } from "../../util/error";
import AuthResourceWithGit from "./AuthResourceWithGit";
import ServiceConfigurationGitSettings from "./ServiceConfigurationGitSettings";
import "./SyncWithGithubPage.scss";

const CLASS_NAME = "sync-with-github-page";

export type GitOrganizationFromGitRepository = {
  id: string;
  name: string;
  type: EnumGitOrganizationType;
};

const SyncWithGithubPage: React.FC = () => {
  const { currentResource, refreshCurrentWorkspace } = useContext(AppContext);

  const { data, error, refetch } = useQuery<{
    resource: Resource;
  }>(GET_RESOURCE_GIT_REPOSITORY, {
    variables: {
      resourceId: currentResource?.id,
    },
    skip: !currentResource?.id,
  });

  const handleOnDone = useCallback(() => {
    refreshCurrentWorkspace();
    refetch();
  }, [refreshCurrentWorkspace, refetch]);

  const pageTitle = "GitHub";
  const errorMessage = formatError(error);
  const isProjectConfiguration =
    data?.resource.resourceType === EnumResourceType.ProjectConfiguration;

  return (
    <PageContent pageTitle={pageTitle}>
      <div className={CLASS_NAME}>
        <div className={`${CLASS_NAME}__header`}>
          <p className={`${CLASS_NAME}__header__title`}>
            Sync with Git Provider
          </p>
        </div>
        <div className={`${CLASS_NAME}__message`}>
          Enable sync with Git provider to automatically push the generated code
          of your application and create a Pull Request in your Git provider
          repository every time you commit your changes.
        </div>
        {data?.resource && isProjectConfiguration && (
          <AuthResourceWithGit resource={data.resource} onDone={handleOnDone} />
        )}
        {!isProjectConfiguration && data?.resource && (
          <ServiceConfigurationGitSettings
            resource={data.resource}
            onDone={handleOnDone}
          />
        )}
        <Snackbar open={Boolean(error)} message={errorMessage} />
      </div>
    </PageContent>
  );
};

export default SyncWithGithubPage;

export const GET_RESOURCE_GIT_REPOSITORY = gql`
  query getResourceGitRepository($resourceId: String!) {
    resource(where: { id: $resourceId }) {
      id
      name
      githubLastSync
      resourceType
      gitRepositoryOverride
      createdAt
      gitRepository {
        id
        name
        gitOrganization {
          id
          name
          type
        }
      }
    }
  }
`;
