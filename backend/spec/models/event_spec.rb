require "rails_helper"

# == Schema Information
#
# Table name: events
#
#  id           :bigint           not null, primary key
#  description  :text
#  name         :string           not null
#  public_token :string           not null
#  time_zone    :string           not null
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#
# Indexes
#
#  index_events_on_public_token  (public_token) UNIQUE
#
RSpec.describe Event, type: :model do
  describe "validations" do
    it "requires between one and ten time options" do
      event = build(:event, with_time_option: false)

      expect(event).not_to be_valid
      expect(event.errors[:time_options]).to include("must contain between 1 and 10 options")

      event.time_options = 10.times.map { |index| build(:time_option, starts_at: (index + 1).days.from_now) }
      expect(event).to be_valid

      event.time_options << build(:time_option, starts_at: 11.days.from_now)
      expect(event).not_to be_valid
    end

    it "validates the time zone identifier" do
      event = build(:event, time_options: [ build(:time_option) ], time_zone: "Invalid/Timezone")

      expect(event).not_to be_valid
      expect(event.errors[:time_zone]).to include("is invalid")
    end
  end

  describe "public token" do
    it "generates a prototype-length URL-safe token" do
      event = create(:event)

      expect(event.public_token).to match(/\A[A-Za-z0-9_-]{43}\z/)
    end
  end
end
