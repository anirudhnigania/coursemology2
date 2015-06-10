# Test group helpers for setting the tenant for tests.
module ActsAsTenant::TestGroupHelpers
  module ModelHelpers
    # Sets the current tenant when running this group of tests.
    #
    # @param [Symbol] tenant The symbol containing the tenant to use for this group of
    #   tests. The tenant must have been set using a let construct.
    # @param [Proc] proc The block containing the test definitions.
    def with_tenant(tenant, &proc)
      context "with tenant #{tenant.inspect}" do |*params|
        before(:each) do
          ActsAsTenant.current_tenant = send(tenant)
        end
        after(:each) do
          ActsAsTenant.current_tenant = nil
        end
        instance_exec(*params, &proc)
      end
    end
  end

  module ControllerHelpers
    include ModelHelpers
    # Sets the current tenant and host when running this group of tests.
    #
    # @param [Symbol] tenant The symbol containing the tenant to use for this group of
    #   tests. The tenant must have been set using a let construct.
    # @param [Proc] proc The block containing the test definitions.
    def with_tenant(tenant, &proc)
      super(tenant) do |*params|
        before(:each) do
          @request.headers['host'] = send(tenant).host
        end
        instance_exec(*params, &proc)
      end
    end
  end

  module FeatureHelpers
    include ModelHelpers
    # Sets the current tenant and host when running this group of tests.
    #
    # @param [Symbol] tenant The symbol containing the tenant to use for this group of
    #   tests. The tenant must have been set using a let construct.
    # @param [Proc] proc The block containing the test definitions.
    def with_tenant(tenant, &proc)
      super(tenant) do |*params|
        before(:each) do
          @saved_host = Capybara.app_host
          # Capybara's app_host is for remote testing, it's not recommend to change it for
          # multiple times. However, currently we cannot find a better way to do this
          Capybara.app_host = 'http://' + send(tenant).host
        end
        after(:each) { Capybara.app_host = @saved_host }

        instance_exec(*params, &proc)
      end
    end
  end
end

module ActsAsTenant::TestExampleHelpers
  module FeatureHelpers
    [:visit, :click_button].each do |method|
      define_method(method) do |*args|
        # Unset the active tenant, let the request flow through the Rack stack and allow our own
        # code to deduce the tenant from the host name.
        ActsAsTenant.with_tenant(nil) do
          super(*args)
        end
      end
    end
  end
end

RSpec.configure do |config|
  config.extend ActsAsTenant::TestGroupHelpers::ModelHelpers, type: :model
  config.extend ActsAsTenant::TestGroupHelpers::ModelHelpers, type: :helper
  config.extend ActsAsTenant::TestGroupHelpers::ModelHelpers, type: :view
  config.extend ActsAsTenant::TestGroupHelpers::ControllerHelpers, type: :controller
  config.extend ActsAsTenant::TestGroupHelpers::FeatureHelpers, type: :feature
  config.include ActsAsTenant::TestExampleHelpers::FeatureHelpers, type: :feature
end
