import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Trash } from "lucide-react";

interface AboutFormProps {
  content: {
    companyDescription: string;
    mission: string;
    vision: string;
    quote: string;
    quoteAuthor: string;
    quotePosition: string;
    teamMembers: {
      id: string;
      name: string;
      position: string;
      image: string;
    }[];
  };
  onContentSubmit: (e: React.FormEvent) => void;
  onTeamMemberSubmit: (e: React.FormEvent) => void;
  onDeleteMember: (id: string) => void;
  onEditMember: (member: AboutFormProps['content']['teamMembers'][0]) => void;
  editingMember: AboutFormProps['content']['teamMembers'][0] | null;
}

const AboutForm = ({
  content,
  onContentSubmit,
  onTeamMemberSubmit,
  onDeleteMember,
  onEditMember,
  editingMember,
}: AboutFormProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>About Content</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onContentSubmit} className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Company Description</label>
                <Textarea
                  name="companyDescription"
                  defaultValue={content.companyDescription}
                  placeholder="Enter company description"
                  className="mt-1"
                  rows={4}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Mission</label>
                <Textarea
                  name="mission"
                  defaultValue={content.mission}
                  placeholder="Enter company mission"
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Vision</label>
                <Textarea
                  name="vision"
                  defaultValue={content.vision}
                  placeholder="Enter company vision"
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Quote</label>
                  <Textarea
                    name="quote"
                    defaultValue={content.quote}
                    placeholder="Enter quote"
                    className="mt-1"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Quote Author</label>
                  <Input
                    name="quoteAuthor"
                    defaultValue={content.quoteAuthor}
                    placeholder="Enter quote author"
                    className="mt-1"
                  />
                  <Input
                    name="quotePosition"
                    defaultValue={content.quotePosition}
                    placeholder="Enter author position"
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
            <Button type="submit">Update Content</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onTeamMemberSubmit} className="space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                name="name"
                placeholder="Name"
                defaultValue={editingMember?.name || ""}
              />
              <Input
                name="position"
                placeholder="Position"
                defaultValue={editingMember?.position || ""}
              />
              <Input
                name="image"
                placeholder="Image URL"
                defaultValue={editingMember?.image || ""}
              />
            </div>
            <Button type="submit">
              {editingMember ? "Update Member" : "Add Member"}
            </Button>
            {editingMember && (
              <Button
                type="button"
                variant="outline"
                onClick={() => onEditMember(null)}
                className="ml-2"
              >
                Cancel
              </Button>
            )}
          </form>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {content.teamMembers.map((member) => (
              <Card key={member.id}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <img
                      src={member.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}`}
                      alt={member.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{member.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {member.position}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onEditMember(member)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onDeleteMember(member.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AboutForm;