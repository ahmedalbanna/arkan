
import { fetchProjects, createProject, updateProject, deleteProject } from '@/services';
import fetchMock from 'jest-fetch-mock';

fetchMock.enableMocks();

const MOCK_TOKEN = 'test-token';
const MOCK_PROJECT = {
  id: 'proj-123',
  userId: 'user-abc',
  name: 'Test Project',
  projectIdea: 'A test project idea.',
  proposal: { title: 'Test Proposal', objective: 'To test.', category: 'Software', methodology: 'Agile', timeline: { startDate: '2023-01-01', endDate: '2023-01-31', phases: [] }, budget: { totalAmount: 0, currency: 'USD', breakdown: [] }, expected_outcome: [], success_criteria: [], evaluation: '', stakeholders: [], risks: [] },
  projectPlan: { phases: [] },
  sections: {},
  diagrams: {},
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('Project Service API Calls', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  describe('fetchProjects', () => {
    it('should fetch projects successfully', async () => {
      fetchMock.mockResponseOnce(JSON.stringify([MOCK_PROJECT]));
      const projects = await fetchProjects(MOCK_TOKEN);
      expect(projects).toEqual([MOCK_PROJECT]);
      expect(fetchMock.mock.calls[0][0]).toBe('/api/projects');
      expect(fetchMock.mock.calls[0][1]?.headers).toEqual({
        'Authorization': `Bearer ${MOCK_TOKEN}`
      });
    });

    it('should throw an error if the fetch fails', async () => {
      fetchMock.mockReject(new Error('API is down'));
      await expect(fetchProjects(MOCK_TOKEN)).rejects.toThrow('Failed to fetch projects');
    });
  });

  describe('createProject', () => {
    it('should create a project successfully', async () => {
      fetchMock.mockResponseOnce(JSON.stringify(MOCK_PROJECT));
      const newProject = await createProject(MOCK_PROJECT as any, MOCK_TOKEN);
      expect(newProject).toEqual(MOCK_PROJECT);
      expect(fetchMock.mock.calls[0][0]).toBe('/api/projects');
      expect(fetchMock.mock.calls[0][1]?.method).toBe('POST');
      expect(JSON.parse(fetchMock.mock.calls[0][1]?.body as string)).toEqual(MOCK_PROJECT);
    });
  });

  describe('updateProject', () => {
    it('should update a project successfully', async () => {
        const updatedData = { ...MOCK_PROJECT, name: 'Updated Name' };
        fetchMock.mockResponseOnce(JSON.stringify(updatedData));
        const updatedProject = await updateProject(MOCK_PROJECT.id, updatedData, MOCK_TOKEN);
        expect(updatedProject.name).toBe('Updated Name');
        expect(fetchMock.mock.calls[0][0]).toBe(`/api/projects/${MOCK_PROJECT.id}`);
        expect(fetchMock.mock.calls[0][1]?.method).toBe('PUT');
    });
  });

  describe('deleteProject', () => {
    it('should delete a project successfully', async () => {
      fetchMock.mockResponseOnce(JSON.stringify({ message: 'Project deleted' }));
      const response = await deleteProject(MOCK_PROJECT.id, MOCK_TOKEN);
      expect(response.message).toBe('Project deleted');
       expect(fetchMock.mock.calls[0][0]).toBe(`/api/projects/${MOCK_PROJECT.id}`);
      expect(fetchMock.mock.calls[0][1]?.method).toBe('DELETE');
    });
  });
});
